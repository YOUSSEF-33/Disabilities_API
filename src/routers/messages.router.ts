import { Router } from 'express';
import { getConversationHistory } from '../controllers/messages.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/:userId', authMiddleware as any, getConversationHistory as any);

export default router;
