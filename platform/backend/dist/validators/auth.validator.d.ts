import { z } from 'zod';
export declare const loginSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
}, {
    password: string;
    email: string;
}>;
export declare const passwordComplexitySchema: z.ZodString;
export declare const changePasswordSchema: z.ZodObject<{
    currentPassword: z.ZodString;
    newPassword: z.ZodString;
}, "strip", z.ZodTypeAny, {
    currentPassword: string;
    newPassword: string;
}, {
    currentPassword: string;
    newPassword: string;
}>;
export declare const createAdminSchema: z.ZodObject<{
    email: z.ZodString;
    password: z.ZodString;
    name: z.ZodString;
    role: z.ZodEnum<["SUPER_ADMIN", "ADMIN", "EDITOR"]>;
}, "strip", z.ZodTypeAny, {
    password: string;
    email: string;
    name: string;
    role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
}, {
    password: string;
    email: string;
    name: string;
    role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
}>;
export declare const updateAdminSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<["SUPER_ADMIN", "ADMIN", "EDITOR"]>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    password: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    password?: string | undefined;
    email?: string | undefined;
    name?: string | undefined;
    role?: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | undefined;
    isActive?: boolean | undefined;
}, {
    password?: string | undefined;
    email?: string | undefined;
    name?: string | undefined;
    role?: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | undefined;
    isActive?: boolean | undefined;
}>;
