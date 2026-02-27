import {
    createServiceRequest,
    getAllServiceRequests,
    getUrgentServiceRequests,
    getServiceRequestById,
    acceptServiceRequest,
    completeServiceRequest,
    cancelServiceRequest,
} from "@/controllers/serviceRequests.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.post("/", authMiddleware, createServiceRequest);
router.get("/", authMiddleware, getAllServiceRequests);
router.get("/urgent", authMiddleware, getUrgentServiceRequests);
router.get("/:id", authMiddleware, getServiceRequestById);
router.patch("/:id/accept", authMiddleware, acceptServiceRequest);
router.patch("/:id/complete", authMiddleware, completeServiceRequest);
router.patch("/:id/cancel", authMiddleware, cancelServiceRequest);

export default router;
