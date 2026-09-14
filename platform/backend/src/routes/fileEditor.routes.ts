import { Router } from 'express';
import { FileEditorController } from '../controllers/fileEditor.controller';
import { authenticateAdmin, requireRole } from '../middleware/auth.middleware';

const router = Router();

// Only SUPER_ADMIN can inspect or edit core server/website files
router.use(authenticateAdmin);
router.use(requireRole(['SUPER_ADMIN']));

router.get('/tree', FileEditorController.getFileTree);
router.get('/read', FileEditorController.readFile);
router.put('/write', FileEditorController.writeFile);

export default router;
