import { Router } from 'express';
import { addReview, getVolunteerReviews } from '../controllers/reviews.controller.ts';
import { authMiddleware } from '../../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware as any, addReview as any);
router.get('/volunteer/:id', authMiddleware as any, getVolunteerReviews as any);

export default router;
