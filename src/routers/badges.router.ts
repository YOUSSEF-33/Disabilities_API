import { Router } from "express";
import * as badgesController from "@/controllers/badges.controller";
import { authMiddleware, adminMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Publicly viewable badges
router.get("/", badgesController.getAllBadges);
router.get("/volunteer/:id", badgesController.getVolunteerBadges);

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, badgesController.createBadge);
router.post("/award", authMiddleware, adminMiddleware, badgesController.awardBadge);

export default router;
