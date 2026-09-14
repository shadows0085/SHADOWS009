import { z } from 'zod';
export declare const createProjectSchema: z.ZodObject<{
    id: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    assetId: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    file: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>;
    category: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>;
    cat_label: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    title: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>;
    meta: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    size: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    thumb: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    thumb_color: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    expectedVersion: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    title: string;
    file: string;
    category: string;
    size: string;
    expectedVersion: number;
    meta?: string | undefined;
    id?: string | undefined;
    cat_label?: string | undefined;
    thumb_color?: string | undefined;
    assetId?: string | undefined;
    thumb?: string | undefined;
}, {
    title: string;
    file: string;
    category: string;
    expectedVersion: number;
    meta?: string | undefined;
    id?: string | undefined;
    cat_label?: string | undefined;
    size?: string | undefined;
    thumb_color?: string | undefined;
    assetId?: string | undefined;
    thumb?: string | undefined;
}>;
export declare const updateProjectSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    category: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    cat_label: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    meta: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    file: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    assetId: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    size: z.ZodOptional<z.ZodString>;
    thumb: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    thumb_color: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    expectedVersion: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    expectedVersion: number;
    meta?: string | undefined;
    title?: string | undefined;
    file?: string | undefined;
    category?: string | undefined;
    cat_label?: string | undefined;
    size?: string | undefined;
    thumb_color?: string | undefined;
    assetId?: string | undefined;
    thumb?: string | undefined;
}, {
    expectedVersion: number;
    meta?: string | undefined;
    title?: string | undefined;
    file?: string | undefined;
    category?: string | undefined;
    cat_label?: string | undefined;
    size?: string | undefined;
    thumb_color?: string | undefined;
    assetId?: string | undefined;
    thumb?: string | undefined;
}>;
export declare const heroSchema: z.ZodObject<{
    src: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    assetId: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    type: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    label: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    badge: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    expectedVersion: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    expectedVersion: number;
    type?: string | undefined;
    assetId?: string | undefined;
    src?: string | undefined;
    label?: string | undefined;
    badge?: string | undefined;
}, {
    expectedVersion: number;
    type?: string | undefined;
    assetId?: string | undefined;
    src?: string | undefined;
    label?: string | undefined;
    badge?: string | undefined;
}>;
export declare const showcaseSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    plainTitle: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    assetId: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    file: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    category: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    badge: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    description: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    productionTime: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    locations: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    resolution: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    duration: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    progress: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    expectedVersion: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    expectedVersion: number;
    title?: string | undefined;
    duration?: string | undefined;
    description?: string | undefined;
    file?: string | undefined;
    category?: string | undefined;
    assetId?: string | undefined;
    badge?: string | undefined;
    plainTitle?: string | undefined;
    productionTime?: string | undefined;
    locations?: string | undefined;
    resolution?: string | undefined;
    progress?: string | undefined;
}, {
    expectedVersion: number;
    title?: string | undefined;
    duration?: string | undefined;
    description?: string | undefined;
    file?: string | undefined;
    category?: string | undefined;
    assetId?: string | undefined;
    badge?: string | undefined;
    plainTitle?: string | undefined;
    productionTime?: string | undefined;
    locations?: string | undefined;
    resolution?: string | undefined;
    progress?: string | undefined;
}>;
export declare const notificationItemSchema: z.ZodObject<{
    id: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>;
    enabled: z.ZodBoolean;
    title: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>;
    message: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>;
    badge: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    type: z.ZodDefault<z.ZodEnum<["gold", "alert", "info", "success"]>>;
    actionText: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    actionLink: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    updatedAt: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
}, "strip", z.ZodTypeAny, {
    message: string;
    type: "info" | "gold" | "alert" | "success";
    id: string;
    title: string;
    enabled: boolean;
    updatedAt?: string | undefined;
    badge?: string | undefined;
    actionText?: string | undefined;
    actionLink?: string | undefined;
}, {
    message: string;
    id: string;
    title: string;
    enabled: boolean;
    type?: "info" | "gold" | "alert" | "success" | undefined;
    updatedAt?: string | undefined;
    badge?: string | undefined;
    actionText?: string | undefined;
    actionLink?: string | undefined;
}>;
export declare const notificationsSchema: z.ZodObject<{
    globalEnabled: z.ZodBoolean;
    activeId: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>;
        enabled: z.ZodBoolean;
        title: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>;
        message: z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>;
        badge: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
        type: z.ZodDefault<z.ZodEnum<["gold", "alert", "info", "success"]>>;
        actionText: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
        actionLink: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
        updatedAt: z.ZodOptional<z.ZodEffects<z.ZodEffects<z.ZodEffects<z.ZodString, string, string>, string, string>, string, string>>;
    }, "strip", z.ZodTypeAny, {
        message: string;
        type: "info" | "gold" | "alert" | "success";
        id: string;
        title: string;
        enabled: boolean;
        updatedAt?: string | undefined;
        badge?: string | undefined;
        actionText?: string | undefined;
        actionLink?: string | undefined;
    }, {
        message: string;
        id: string;
        title: string;
        enabled: boolean;
        type?: "info" | "gold" | "alert" | "success" | undefined;
        updatedAt?: string | undefined;
        badge?: string | undefined;
        actionText?: string | undefined;
        actionLink?: string | undefined;
    }>, "many">;
    expectedVersion: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    expectedVersion: number;
    globalEnabled: boolean;
    items: {
        message: string;
        type: "info" | "gold" | "alert" | "success";
        id: string;
        title: string;
        enabled: boolean;
        updatedAt?: string | undefined;
        badge?: string | undefined;
        actionText?: string | undefined;
        actionLink?: string | undefined;
    }[];
    activeId?: string | undefined;
}, {
    expectedVersion: number;
    globalEnabled: boolean;
    items: {
        message: string;
        id: string;
        title: string;
        enabled: boolean;
        type?: "info" | "gold" | "alert" | "success" | undefined;
        updatedAt?: string | undefined;
        badge?: string | undefined;
        actionText?: string | undefined;
        actionLink?: string | undefined;
    }[];
    activeId?: string | undefined;
}>;
