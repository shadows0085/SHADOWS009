import { z } from 'zod';

// Disallow dangerous HTML tags and event handlers to prevent persistent XSS
const sanitizeString = (maxLen: number) =>
  z
    .string()
    .max(maxLen)
    .refine(
      (val) => !/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi.test(val),
      { message: 'Script tags are strictly prohibited.' }
    )
    .refine(
      (val) => !/on\w+\s*=/i.test(val),
      { message: 'Inline event handlers (e.g. onerror, onclick) are prohibited.' }
    )
    .refine(
      (val) => !/javascript\s*:/i.test(val),
      { message: 'Javascript URIs are prohibited.' }
    );

const expectedVersionSchema = z.number().int().positive();

export const createProjectSchema = z.object({
  id: sanitizeString(64).optional(),
  assetId: sanitizeString(64).optional(),
  file: sanitizeString(256),
  category: sanitizeString(64),
  cat_label: sanitizeString(128).optional(),
  title: sanitizeString(256),
  meta: sanitizeString(256).optional(),
  size: z.string().max(64).optional().default('card-md'),
  thumb: sanitizeString(256).optional(),
  thumb_color: sanitizeString(64).optional(),
  expectedVersion: expectedVersionSchema
});

export const updateProjectSchema = z.object({
  title: sanitizeString(256).optional(),
  category: sanitizeString(64).optional(),
  cat_label: sanitizeString(128).optional(),
  meta: sanitizeString(256).optional(),
  file: sanitizeString(256).optional(),
  assetId: sanitizeString(64).optional(),
  size: z.string().max(64).optional(),
  thumb: sanitizeString(256).optional(),
  thumb_color: sanitizeString(64).optional(),
  expectedVersion: expectedVersionSchema
}).strict();

export const heroSchema = z.object({
  src: sanitizeString(256).optional(),
  assetId: sanitizeString(64).optional(),
  type: sanitizeString(32).optional(),
  label: sanitizeString(128).optional(),
  badge: sanitizeString(64).optional(),
  expectedVersion: expectedVersionSchema
}).strict();

export const showcaseSchema = z.object({
  title: sanitizeString(256).optional(),
  plainTitle: sanitizeString(256).optional(),
  assetId: sanitizeString(64).optional(),
  file: sanitizeString(256).optional(),
  category: sanitizeString(128).optional(),
  badge: sanitizeString(64).optional(),
  description: sanitizeString(1024).optional(),
  productionTime: sanitizeString(64).optional(),
  locations: sanitizeString(64).optional(),
  resolution: sanitizeString(64).optional(),
  duration: sanitizeString(32).optional(),
  progress: sanitizeString(16).optional(),
  expectedVersion: expectedVersionSchema
}).strict();

export const notificationItemSchema = z.object({
  id: sanitizeString(64),
  enabled: z.boolean(),
  title: sanitizeString(128),
  message: sanitizeString(512),
  badge: sanitizeString(64).optional(),
  type: z.enum(['gold', 'alert', 'info', 'success']).default('gold'),
  actionText: sanitizeString(64).optional(),
  actionLink: sanitizeString(256).optional(),
  updatedAt: sanitizeString(64).optional()
});

export const notificationsSchema = z.object({
  globalEnabled: z.boolean(),
  activeId: sanitizeString(64).optional(),
  items: z.array(notificationItemSchema),
  expectedVersion: expectedVersionSchema
}).strict();
