import { z } from 'zod';
export declare const createVideoSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    storageKey: z.ZodString;
    thumbnailKey: z.ZodOptional<z.ZodString>;
    mimeType: z.ZodEnum<["video/mp4", "video/webm", "video/quicktime"]>;
    fileSize: z.ZodNumber;
    duration: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    status: z.ZodDefault<z.ZodOptional<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>>;
    visibility: z.ZodDefault<z.ZodOptional<z.ZodEnum<["PUBLIC", "PRIVATE", "UNLISTED"]>>>;
}, "strip", z.ZodTypeAny, {
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    title: string;
    fileSize: number;
    duration: number;
    storageKey: string;
    mimeType: "video/mp4" | "video/webm" | "video/quicktime";
    visibility: "PUBLIC" | "PRIVATE" | "UNLISTED";
    description?: string | undefined;
    thumbnailKey?: string | undefined;
}, {
    title: string;
    fileSize: number;
    storageKey: string;
    mimeType: "video/mp4" | "video/webm" | "video/quicktime";
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    duration?: number | undefined;
    description?: string | undefined;
    thumbnailKey?: string | undefined;
    visibility?: "PUBLIC" | "PRIVATE" | "UNLISTED" | undefined;
}>;
export declare const updateVideoSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    thumbnailKey: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>;
    visibility: z.ZodOptional<z.ZodEnum<["PUBLIC", "PRIVATE", "UNLISTED"]>>;
    duration: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    title?: string | undefined;
    duration?: number | undefined;
    description?: string | null | undefined;
    thumbnailKey?: string | null | undefined;
    visibility?: "PUBLIC" | "PRIVATE" | "UNLISTED" | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    title?: string | undefined;
    duration?: number | undefined;
    description?: string | null | undefined;
    thumbnailKey?: string | null | undefined;
    visibility?: "PUBLIC" | "PRIVATE" | "UNLISTED" | undefined;
}>;
export declare const videoQuerySchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "PUBLISHED", "ARCHIVED"]>>;
    visibility: z.ZodOptional<z.ZodEnum<["PUBLIC", "PRIVATE", "UNLISTED"]>>;
    uploadedBy: z.ZodOptional<z.ZodString>;
    sortBy: z.ZodDefault<z.ZodOptional<z.ZodEnum<["createdAt", "updatedAt", "title", "fileSize", "duration"]>>>;
    sortOrder: z.ZodDefault<z.ZodOptional<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    page: number;
    sortBy: "createdAt" | "updatedAt" | "title" | "fileSize" | "duration";
    sortOrder: "asc" | "desc";
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    search?: string | undefined;
    visibility?: "PUBLIC" | "PRIVATE" | "UNLISTED" | undefined;
    uploadedBy?: string | undefined;
}, {
    status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | undefined;
    limit?: number | undefined;
    search?: string | undefined;
    visibility?: "PUBLIC" | "PRIVATE" | "UNLISTED" | undefined;
    uploadedBy?: string | undefined;
    page?: number | undefined;
    sortBy?: "createdAt" | "updatedAt" | "title" | "fileSize" | "duration" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
