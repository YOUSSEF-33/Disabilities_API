import { Router } from "express";
import usersRouter from "./users.router";
import authRouter from "./auth.router";
import volunteersRouter from "./volunteers.router";
import serviceRequestsRouter from "./serviceRequests.router";
import appointmentsRouter from "./appointments.router";
import resourcesRouter from "./resources.router";
import reviewsRouter from "./reviews.router";
import messagesRouter from "./messages.router";
import sosRouter from "./sos.router";
import locationsRouter from "./locations.router";
import badgesRouter from "./badges.router";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/volunteers", volunteersRouter);
router.use("/service-requests", serviceRequestsRouter);
router.use("/appointments", appointmentsRouter);
router.use("/resources", resourcesRouter);
router.use("/reviews", reviewsRouter);
router.use("/messages", messagesRouter);
router.use("/sos", sosRouter);
router.use("/locations", locationsRouter);
router.use("/badges", badgesRouter);

export default router;