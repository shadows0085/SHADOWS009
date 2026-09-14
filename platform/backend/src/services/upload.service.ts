import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../repositories/prisma.client';
import { storageService } from './storage.service';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface FileValidationResult {
  valid: boolean;
  mimeType?: string;
  error?: string;
}

export class UploadService {
  /**
   * Magic bytes verification inspecting file header signatures
   */
  static verifyFileSignature(buffer: Buffer): FileValidationResult {
    if (!buffer || buffer.length < 12) {
      return { valid: false, error: 'FILE_BUFFER_TOO_SMALL' };
    }

    // 1. MP4 / M4V / QuickTime check: 'ftyp' at offset 4
    if (buffer.subarray(4, 8).toString('ascii') === 'ftyp') {
      const majorBrand = buffer.subarray(8, 12).toString('ascii');
      return { valid: true, mimeType: 'video/mp4' };
    }

    // 2. WebM check: EBML Header (0x1A 0x45 0xDF 0xA3) at start
    if (
      buffer[0] === 0x1a &&
      buffer[1] === 0x45 &&
      buffer[2] === 0xdf &&
      buffer[3] === 0xa3
    ) {
      return { valid: true, mimeType: 'video/webm' };
    }

    // 3. QuickTime raw check: 'moov' or 'mdat' or 'wide' at offset 4
    const atomType = buffer.subarray(4, 8).toString('ascii');
    if (['moov', 'mdat', 'wide', 'free'].includes(atomType)) {
      return { valid: true, mimeType: 'video/quicktime' };
    }

    // 4. Image validations for thumbnails
    // JPEG: FF D8 FF
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return { valid: true, mimeType: 'image/jpeg' };
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return { valid: true, mimeType: 'image/png' };
    }

    // WebP: 'RIFF' at 0 and 'WEBP' at 8
    if (
      buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
      buffer.subarray(8, 12).toString('ascii') === 'WEBP'
    ) {
      return { valid: true, mimeType: 'image/webp' };
    }

    return { valid: false, error: 'UNRECOGNIZED_OR_DISALLOWED_FILE_SIGNATURE' };
  }

  /**
   * Sanitizes filenames to prevent null-byte injection, directory traversal, and double extension exploits
   */
  static sanitizeFilename(originalName: string): string {
    const cleanName = path.basename(originalName).replace(/[\0\r\n]/g, '');
    const ext = path.extname(cleanName).toLowerCase();
    const allowedExtensions = ['.mp4', '.webm', '.mov', '.jpg', '.jpeg', '.png', '.webp'];

    if (!allowedExtensions.includes(ext)) {
      throw new Error(`DISALLOWED_FILE_EXTENSION: ${ext}`);
    }

    return cleanName;
  }

  /**
   * Generates isolated random storage key (e.g. videos/2026/09/uuid.mp4)
   * NEVER saves file under original client-controlled filename
   */
  static generateStorageKey(category: 'videos' | 'thumbnails', extension: string): string {
    const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
    const randomName = `${uuidv4()}${extension}`;
    return path.posix.join(category, datePrefix, randomName);
  }

  /**
   * Save uploaded file buffer to isolated storage after multi-stage validation
   */
  static async processUploadedBuffer(
    buffer: Buffer,
    originalFilename: string,
    category: 'videos' | 'thumbnails'
  ): Promise<{ storageKey: string; fileSize: number; mimeType: string }> {
    this.sanitizeFilename(originalFilename);

    if (buffer.length > env.MAX_VIDEO_SIZE_BYTES) {
      throw new Error(`FILE_TOO_LARGE: Max limit is ${env.MAX_VIDEO_SIZE_BYTES} bytes`);
    }

    const sigResult = this.verifyFileSignature(buffer);
    if (!sigResult.valid || !sigResult.mimeType) {
      throw new Error(`INVALID_FILE_SIGNATURE: ${sigResult.error}`);
    }

    const ext = sigResult.mimeType === 'video/mp4' ? '.mp4' :
                sigResult.mimeType === 'video/webm' ? '.webm' :
                sigResult.mimeType === 'image/jpeg' ? '.jpg' :
                sigResult.mimeType === 'image/png' ? '.png' :
                sigResult.mimeType === 'image/webp' ? '.webp' : '.mov';

    const storageKey = this.generateStorageKey(category, ext);
    const result = await storageService.save(buffer, storageKey);

    return {
      storageKey: result.storageKey,
      fileSize: result.fileSize,
      mimeType: sigResult.mimeType
    };
  }

  /**
   * Initiate Resumable Upload Session for large assets
   */
  static async initiateUploadSession(adminId: string, fileName: string, mimeType: string, fileSize: number) {
    this.sanitizeFilename(fileName);

    if (!Number.isSafeInteger(fileSize) || fileSize <= 0 || fileSize > env.MAX_VIDEO_SIZE_BYTES) {
      throw new Error('FILE_SIZE_EXCEEDS_MAXIMUM_CONFIGURED_LIMIT');
    }

    const ext = path.extname(fileName).toLowerCase() || '.mp4';
    const storageKey = this.generateStorageKey('videos', ext);

    const session = await prisma.uploadSession.create({
      data: {
        adminId,
        fileName,
        mimeType,
        fileSize,
        uploadedBytes: 0,
        storageKey,
        status: 'INITIATED'
      }
    });

    return session;
  }

  /**
   * Append chunk to resumable upload
   */
  static async appendChunk(sessionId: string, adminId: string, chunkBuffer: Buffer, chunkIndex: number) {
    const session = await prisma.uploadSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error('UPLOAD_SESSION_NOT_FOUND');

    // Verify session ownership
    if (session.adminId !== adminId) {
      throw new Error('FORBIDDEN_SESSION_OWNER');
    }

    if (session.status === 'COMPLETED' || session.status === 'ABORTED') {
      throw new Error(`INVALID_SESSION_STATUS: ${session.status}`);
    }

    // Per-chunk limit: 50MB max per chunk
    const MAX_CHUNK_SIZE = 50 * 1024 * 1024;
    if (chunkBuffer.length > MAX_CHUNK_SIZE) {
      throw new Error('CHUNK_SIZE_EXCEEDED');
    }

    // Enforce total size quota: cannot exceed declared file size
    const newUploadedBytes = session.uploadedBytes + chunkBuffer.length;
    if (newUploadedBytes > session.fileSize) {
      throw new Error('UPLOAD_EXCEEDS_DECLARED_SIZE');
    }

    // For chunk 0, inspect magic bytes
    if (chunkIndex === 0) {
      const sig = this.verifyFileSignature(chunkBuffer);
      if (!sig.valid) {
        await prisma.uploadSession.update({
          where: { id: sessionId },
          data: { status: 'ABORTED' }
        });
        throw new Error(`INVALID_MAGIC_BYTES_IN_CHUNK_0: ${sig.error}`);
      }
    }

    const tempDir = path.resolve(process.cwd(), env.LOCAL_STORAGE_PATH, 'temp_chunks', sessionId);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const existingChunks = (await fs.promises.readdir(tempDir))
      .filter(file => /^chunk_\d{6}\.part$/.test(file));
    // Chunks are intentionally accepted in order. This prevents an overwritten
    // or skipped part from being counted as successfully uploaded.
    if (chunkIndex !== existingChunks.length) {
      throw new Error('UNEXPECTED_CHUNK_INDEX');
    }

    const chunkPath = path.join(tempDir, `chunk_${String(chunkIndex).padStart(6, '0')}.part`);
    await fs.promises.writeFile(chunkPath, chunkBuffer);

    await prisma.uploadSession.update({
      where: { id: sessionId },
      data: {
        uploadedBytes: newUploadedBytes,
        status: 'UPLOADING'
      }
    });

    return {
      sessionId,
      uploadedBytes: newUploadedBytes,
      totalBytes: session.fileSize,
      percentage: Math.min(100, Math.round((newUploadedBytes / session.fileSize) * 100))
    };
  }

  /**
   * Finalize and assemble chunks
   */
  static async finalizeUploadSession(sessionId: string, adminId: string) {
    const session = await prisma.uploadSession.findUnique({ where: { id: sessionId } });
    if (!session) throw new Error('UPLOAD_SESSION_NOT_FOUND');

    // Verify session ownership
    if (session.adminId !== adminId) {
      throw new Error('FORBIDDEN_SESSION_OWNER');
    }

    const tempDir = path.resolve(process.cwd(), env.LOCAL_STORAGE_PATH, 'temp_chunks', sessionId);
    if (!fs.existsSync(tempDir)) {
      throw new Error('CHUNKS_DIRECTORY_NOT_FOUND');
    }

    const chunkFiles = (await fs.promises.readdir(tempDir))
      .filter(f => f.startsWith('chunk_') && f.endsWith('.part'))
      .sort();

    const targetPath = storageService.getAbsolutePath(session.storageKey);
    const parentDir = path.dirname(targetPath);
    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    const writeStream = fs.createWriteStream(targetPath);

    for (const file of chunkFiles) {
      const partPath = path.join(tempDir, file);
      const data = await fs.promises.readFile(partPath);
      writeStream.write(data);
      await fs.promises.unlink(partPath); // clean up part
    }

    await new Promise((resolve, reject) => {
      writeStream.end(resolve);
      writeStream.on('error', reject);
    });

    // Remove temp folder
    try {
      await fs.promises.rmdir(tempDir);
    } catch {}

    const stats = await fs.promises.stat(targetPath);

    // Verify assembled total file size matches declared session fileSize
    if (stats.size !== session.fileSize) {
      await fs.promises.unlink(targetPath).catch(() => {});
      await prisma.uploadSession.update({
        where: { id: sessionId },
        data: { status: 'ABORTED' }
      });
      throw new Error('FILE_SIZE_MISMATCH');
    }

    // Validate the assembled file as well as its first chunk. This ensures a
    // completed session cannot register a corrupt or substituted video.
    const header = Buffer.alloc(12);
    const handle = await fs.promises.open(targetPath, 'r');
    try {
      await handle.read(header, 0, header.length, 0);
    } finally {
      await handle.close();
    }
    const signature = this.verifyFileSignature(header);
    if (!signature.valid || !signature.mimeType) {
      await fs.promises.unlink(targetPath).catch(() => {});
      await prisma.uploadSession.update({
        where: { id: sessionId },
        data: { status: 'ABORTED' }
      });
      throw new Error(`INVALID_ASSEMBLED_FILE_SIGNATURE: ${signature.error}`);
    }

    await prisma.uploadSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        uploadedBytes: stats.size
      }
    });

    return {
      storageKey: session.storageKey,
      fileSize: stats.size,
      mimeType: signature.mimeType
    };
  }

  /**
   * Query status of an in-progress upload session for resume capability
   */
  static async getSessionStatus(sessionId: string, adminId: string) {
    const session = await prisma.uploadSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      throw new Error('SESSION_NOT_FOUND');
    }

    if (session.adminId !== adminId) {
      throw new Error('FORBIDDEN_SESSION_OWNER');
    }

    const tempDir = path.resolve(process.cwd(), env.LOCAL_STORAGE_PATH, 'temp_chunks', sessionId);
    let chunksCount = 0;
    if (fs.existsSync(tempDir)) {
      const files = await fs.promises.readdir(tempDir);
      chunksCount = files.filter(file => /^chunk_\d{6}\.part$/.test(file)).length;
    }

    return {
      sessionId: session.id,
      fileName: session.fileName,
      mimeType: session.mimeType,
      fileSize: session.fileSize,
      uploadedBytes: session.uploadedBytes,
      chunksUploaded: chunksCount,
      percentage: Math.min(100, Math.round((session.uploadedBytes / session.fileSize) * 100)),
      status: session.status,
      updatedAt: session.updatedAt
    };
  }

  /**
   * Explicitly cancel an upload session and delete all associated partial chunks from disk
   */
  static async cancelSession(sessionId: string, adminId: string) {
    const session = await prisma.uploadSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return { success: true, message: 'Session already removed.' };
    }

    if (session.adminId !== adminId) {
      throw new Error('FORBIDDEN_SESSION_OWNER');
    }

    // Purge temporary chunks from filesystem
    const tempDir = path.resolve(process.cwd(), env.LOCAL_STORAGE_PATH, 'temp_chunks', sessionId);
    if (fs.existsSync(tempDir)) {
      try {
        await fs.promises.rm(tempDir, { recursive: true, force: true });
      } catch (err: any) {
        logger.warn({ err }, `Failed to remove temp chunk directory for session ${sessionId}`);
      }
    }

    await prisma.uploadSession.update({
      where: { id: sessionId },
      data: { status: 'ABORTED' }
    });

    return { success: true, sessionId, status: 'ABORTED' };
  }

  /**
   * Periodic garbage collection for upload sessions that can no longer resume.
   * Both their metadata and temporary chunks are removed so stale rows cannot
   * later be resumed with an incorrect uploaded-byte count.
   */
  static async cleanupExpiredSessions(): Promise<number> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const expiredSessions = await prisma.uploadSession.findMany({
      where: {
        OR: [
          { status: { in: ['INITIATED', 'UPLOADING'] }, updatedAt: { lt: cutoff } },
          { status: 'ABORTED' },
          { status: 'COMPLETED', updatedAt: { lt: cutoff } }
        ]
      },
      take: 50
    });

    let cleaned = 0;
    for (const session of expiredSessions) {
      const tempDir = path.resolve(process.cwd(), env.LOCAL_STORAGE_PATH, 'temp_chunks', session.id);
      if (fs.existsSync(tempDir)) {
        try {
          await fs.promises.rm(tempDir, { recursive: true, force: true });
        } catch (_) {}
      }

      try {
        await prisma.uploadSession.delete({ where: { id: session.id } });
      } catch (_) {}
      cleaned++;
    }

    return cleaned;
  }
}
