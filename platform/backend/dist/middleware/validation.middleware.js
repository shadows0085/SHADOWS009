"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const validateRequest = (schema) => {
    return async (req, res, next) => {
        try {
            if (schema.body) {
                req.body = await schema.body.parseAsync(req.body);
            }
            if (schema.query) {
                req.query = await schema.query.parseAsync(req.query);
            }
            if (schema.params) {
                req.params = await schema.params.parseAsync(req.params);
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const issues = error.issues.map(issue => ({
                    field: issue.path.join('.'),
                    message: issue.message
                }));
                const detailedMsg = issues.map(i => (i.field ? `${i.field}: ${i.message}` : i.message)).join('; ');
                res.status(400).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: detailedMsg || 'Invalid request parameters',
                        details: issues
                    }
                });
                return;
            }
            res.status(400).json({
                success: false,
                error: {
                    code: 'BAD_REQUEST',
                    message: 'Failed to process request data'
                }
            });
        }
    };
};
exports.validateRequest = validateRequest;
