import { z } from 'zod';
export declare const initiateUploadSchema: z.ZodObject<{
    fileName: z.ZodString;
    mimeType: z.ZodEnum<["video/mp4", "video/webm", "video/quicktime"]>;
    fileSize: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    fileSize: number;
    mimeType: "video/mp4" | "video/webm" | "video/quicktime";
    fileName: string;
}, {
    fileSize: number;
    mimeType: "video/mp4" | "video/webm" | "video/quicktime";
    fileName: string;
}>;
export declare const appendChunkParamsSchema: z.ZodObject<{
    sessionId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    sessionId: string;
}, {
    sessionId: string;
}>;
export declare const appendChunkQuerySchema: z.ZodObject<{
    chunkIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    chunkIndex: number;
}, {
    chunkIndex: number;
}>;
