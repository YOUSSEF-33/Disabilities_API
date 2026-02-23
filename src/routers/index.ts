import { Router } from "express";
import usersRouter from "./users.router";
import authRouter from "./auth.router";
import volunteersRouter from "./volunteers.router";
import serviceRequestsRouter from "./serviceRequests.router";
import appointmentsRouter from "./appointments.router";
import resourcesRouter from "./resources.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/volunteers", volunteersRouter);
router.use("/service-requests", serviceRequestsRouter);
router.use("/appointments", appointmentsRouter);
router.use("/resources", resourcesRouter);

export default router;