import {
    createAppointment,
    getMyAppointments,
    getAppointmentById,
    updateAppointmentStatus,
} from "@/controllers/appointments.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.post("/", authMiddleware, createAppointment);
router.get("/my", authMiddleware, getMyAppointments);
router.get("/:id", authMiddleware, getAppointmentById);
router.patch("/:id/status", authMiddleware, updateAppointmentStatus);

export default router;
