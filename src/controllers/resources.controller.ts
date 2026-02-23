import { prisma } from "@/lib/prisma";
import type { Request, Response } from "express";

const resourceSelect = {
    id: true,
    title: true,
    description: true,
    url: true,
    category: true,
    createdAt: true,
    updatedAt: true,
    createdBy: { select: { id: true, firstName: true, lastName: true } },
};

// ─── Create Resource (Admin) ──────────────────────────────────────────────────
export const createResource = async (req: Request, res: Response) => {
    try {
        const createdById = req.user.id;
        const { title, description, url, category } = req.body;

        if (!title || !description || !category) {
            return res.status(400).json({ message: "title, description, and category are required" });
        }

        const resource = await prisma.resource.create({
            data: { title, description, url: url ?? null, category, createdById },
            select: resourceSelect,
        });

        res.status(201).json({ message: "Resource created", data: resource });
    } catch (error) {
        res.status(500).json({ message: "Failed to create resource", error });
    }
};

// ─── Get All Resources ────────────────────────────────────────────────────────
export const getAllResources = async (req: Request, res: Response) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Number(req.query.limit) || 10, 100);
        const skip = (page - 1) * limit;
        const category = req.query.category as string | undefined;

        const where = category ? { category: { contains: category, mode: "insensitive" as const } } : {};

        const [resources, total] = await Promise.all([
            prisma.resource.findMany({ where, skip, take: limit, select: resourceSelect, orderBy: { createdAt: "desc" } }),
            prisma.resource.count({ where }),
        ]);

        res.json({ data: resources, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        res.status(500).json({ message: "Failed to get resources", error });
    }
};

// ─── Get Resource By ID ───────────────────────────────────────────────────────
export const getResourceById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const resource = await prisma.resource.findUnique({ where: { id }, select: resourceSelect });
        if (!resource) return res.status(404).json({ message: "Resource not found" });
        res.json({ data: resource });
    } catch (error) {
        res.status(500).json({ message: "Failed to get resource", error });
    }
};

// ─── Update Resource (Admin) ──────────────────────────────────────────────────
export const updateResource = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const { title, description, url, category } = req.body;

        const existing = await prisma.resource.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: "Resource not found" });

        const resource = await prisma.resource.update({
            where: { id },
            data: {
                ...(title !== undefined && { title }),
                ...(description !== undefined && { description }),
                ...(url !== undefined && { url }),
                ...(category !== undefined && { category }),
            },
            select: resourceSelect,
        });

        res.json({ message: "Resource updated", data: resource });
    } catch (error) {
        res.status(500).json({ message: "Failed to update resource", error });
    }
};

// ─── Delete Resource (Admin) ──────────────────────────────────────────────────
export const deleteResource = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const existing = await prisma.resource.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: "Resource not found" });

        await prisma.resource.delete({ where: { id } });
        res.json({ message: "Resource deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete resource", error });
    }
};
