export interface FileValidationResult {
    valid: boolean;
    mimeType?: string;
    error?: string;
}
export declare class UploadService {
    /**
     * Magic bytes verification inspecting file header signatures
     */
    static verifyFileSignature(buffer: Buffer): FileValidationResult;
    /**
     * Sanitizes filenames to prevent null-byte injection, directory traversal, and double extension exploits
     */
    static sanitizeFilename(originalName: string): string;
    /**
     * Generates isolated random storage key (e.g. videos/2026/09/uuid.mp4)
     * NEVER saves file under original client-controlled filename
     */
    static generateStorageKey(category: 'videos' | 'thumbnails', extension: string): string;
    /**
     * Save uploaded file buffer to isolated storage after multi-stage validation
     */
    static processUploadedBuffer(buffer: Buffer, originalFilename: string, category: 'videos' | 'thumbnails'): Promise<{
        storageKey: string;
        fileSize: number;
        mimeType: string;
    }>;
    /**
     * Initiate Resumable Upload Session for large assets
     */
    static initiateUploadSession(adminId: string, fileName: string, mimeType: string, fileSize: number): Promise<{
        status: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        adminId: string;
        fileSize: number;
        storageKey: string;
        mimeType: string;
        fileName: string;
        uploadedBytes: number;
    }>;
    /**
     * Append chunk to resumable upload
     */
    static appendChunk(sessionId: string, adminId: string, chunkBuffer: Buffer, chunkIndex: number): Promise<{
        sessionId: string;
        uploadedBytes: number;
        totalBytes: number;
        percentage: number;
    }>;
    /**
     * Finalize and assemble chunks
     */
    static finalizeUploadSession(sessionId: string, adminId: string): Promise<{
        storageKey: string;
        fileSize: number;
        mimeType: string;
    }>;
    /**
     * Query status of an in-progress upload session for resume capability
     */
    static getSessionStatus(sessionId: string, adminId: string): Promise<{
        sessionId: string;
        fileName: string;
        mimeType: string;
        fileSize: number;
        uploadedBytes: number;
        chunksUploaded: number;
        percentage: number;
        status: string;
        updatedAt: Date;
    }>;
    /**
     * Explicitly cancel an upload session and delete all associated partial chunks from disk
     */
    static cancelSession(sessionId: string, adminId: string): Promise<{
        success: boolean;
        message: string;
        sessionId?: undefined;
        status?: undefined;
    } | {
        success: boolean;
        sessionId: string;
        status: string;
        message?: undefined;
    }>;
    /**
     * Periodic garbage collection for upload sessions that can no longer resume.
     * Both their metadata and temporary chunks are removed so stale rows cannot
     * later be resumed with an incorrect uploaded-byte count.
     */
    static cleanupExpiredSessions(): Promise<number>;
}
