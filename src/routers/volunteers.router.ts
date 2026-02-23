import {
    createVolunteerProfile,
    getAllVolunteers,
    getVolunteerById,
    updateVolunteerProfile,
} from "@/controllers/volunteers.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.post("/", authMiddleware, createVolunteerProfile);
router.get("/", authMiddleware, getAllVolunteers);
router.get("/:id", authMiddleware, getVolunteerById);
router.put("/:id", authMiddleware, updateVolunteerProfile);

export default router;
