import {
    createResource,
    getAllResources,
    getResourceById,
    updateResource,
    deleteResource,
} from "@/controllers/resources.controller";
import { authMiddleware, adminMiddleware } from "../../middlewares/auth.middleware";
import { Router } from "express";

const router = Router();

router.post("/", authMiddleware, adminMiddleware, createResource);
router.get("/", authMiddleware, getAllResources);
router.get("/:id", authMiddleware, getResourceById);
router.put("/:id", authMiddleware, adminMiddleware, updateResource);
router.delete("/:id", authMiddleware, adminMiddleware, deleteResource);

export default router;
