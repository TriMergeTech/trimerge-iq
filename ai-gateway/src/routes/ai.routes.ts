import { Router } from 'express';
import { search, chat, upload } from '../controllers/ai.controller';
import { authenticateJWT } from '../middlewares/auth';
import { uploadMiddleware } from '../middlewares/upload';

const router = Router();

// Protect all AI routes with JWT authentication
router.use(authenticateJWT);

router.get('/search', search);
router.post('/chat', chat);
router.post('/upload', uploadMiddleware.single('file'), upload);

export default router;