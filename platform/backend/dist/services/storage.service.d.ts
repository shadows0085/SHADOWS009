import fs from 'fs';
export interface StorageResult {
    storageKey: string;
    fileSize: number;
}
export interface IStorageProvider {
    save(fileBuffer: Buffer, targetKey: string): Promise<StorageResult>;
    readStream(storageKey: string, range?: {
        start: number;
        end: number;
    }): fs.ReadStream | NodeJS.ReadableStream;
    delete(storageKey: string): Promise<boolean>;
    exists(storageKey: string): Promise<boolean>;
    getFileSize(storageKey: string): Promise<number>;
    getAbsolutePath(storageKey: string): string;
}
export declare class LocalStorageProvider implements IStorageProvider {
    private readonly baseDir;
    constructor();
    private ensureDirectory;
    /**
     * Sanitizes relative storage key and guarantees it remains inside baseDir (Path Traversal Protection)
     */
    getAbsolutePath(storageKey: string): string;
    save(fileBuffer: Buffer, targetKey: string): Promise<StorageResult>;
    readStream(storageKey: string, range?: {
        start: number;
        end: number;
    }): fs.ReadStream;
    delete(storageKey: string): Promise<boolean>;
    exists(storageKey: string): Promise<boolean>;
    getFileSize(storageKey: string): Promise<number>;
}
export declare const storageService: LocalStorageProvider;
