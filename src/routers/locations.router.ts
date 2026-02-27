import { Router } from "express";
import * as locationsController from "@/controllers/locations.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// Public routes
router.get("/", locationsController.getAllLocations);
router.get("/search", locationsController.searchLocations);
router.get("/:id", locationsController.getLocationById);

// Protected routes (require auth)
router.post("/", authMiddleware, locationsController.createLocation);
router.post("/:id/features", authMiddleware, locationsController.addAccessibilityFeature);

export default router;
