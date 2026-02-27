import { Router } from "express";
import * as sosController from "@/controllers/sos.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

// All SOS routes require authentication
router.use(authMiddleware);

router.post("/contacts", sosController.addEmergencyContact);
router.get("/contacts", sosController.getEmergencyContacts);
router.post("/alert", sosController.triggerSOSAlert);
router.get("/alerts", sosController.getActiveSOSAlerts);
router.patch("/alerts/:id/resolve", sosController.resolveSOSAlert);

export default router;
