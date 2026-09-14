import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateAdmin } from '../middleware/auth.middleware';
import { authRateLimiter } from '../middleware/rateLimiter.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { loginSchema, changePasswordSchema } from '../validators/auth.validator';

const router = Router();

router.post('/login', authRateLimiter, validateRequest({ body: loginSchema }), AuthController.login);
router.post('/refresh', AuthController.refreshToken);
router.post('/logout', AuthController.logout);

router.get('/me', authenticateAdmin, AuthController.getMe);
router.post('/change-password', authenticateAdmin, validateRequest({ body: changePasswordSchema }), AuthController.changePassword);
router.get('/sessions', authenticateAdmin, AuthController.getActiveSessions);
router.post('/sessions/revoke-all', authenticateAdmin, AuthController.revokeAllSessions);

export default router;
