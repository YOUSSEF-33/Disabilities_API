import { prisma } from "@/lib/prisma";
import type { Request, Response } from "express";

const requestSelect = {
    id: true,
    title: true,
    description: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    user: { select: { id: true, firstName: true, lastName: true, email: true } },
    volunteer: { select: { id: true, firstName: true, lastName: true, email: true } },
};

// ─── Create Service Request ───────────────────────────────────────────────────
export const createServiceRequest = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { title, description } = req.body;

        if (!title || !description) {
            return res.status(400).json({ message: "title and description are required" });
        }

        const request = await prisma.serviceRequest.create({
            data: { title, description, userId },
            select: requestSelect,
        });

        res.status(201).json({ message: "Service request created", data: request });
    } catch (error) {
        res.status(500).json({ message: "Failed to create service request", error });
    }
};

// ─── Get All Service Requests ─────────────────────────────────────────────────
export const getAllServiceRequests = async (req: Request, res: Response) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Number(req.query.limit) || 10, 100);
        const skip = (page - 1) * limit;
        const status = req.query.status as string | undefined;

        const where = status ? { status: status as any } : {};

        const [requests, total] = await Promise.all([
            prisma.serviceRequest.findMany({ where, skip, take: limit, select: requestSelect, orderBy: { createdAt: "desc" } }),
            prisma.serviceRequest.count({ where }),
        ]);

        res.json({ data: requests, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        res.status(500).json({ message: "Failed to get service requests", error });
    }
};

// ─── Get Service Request By ID ────────────────────────────────────────────────
export const getServiceRequestById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const request = await prisma.serviceRequest.findUnique({ where: { id }, select: requestSelect });
        if (!request) return res.status(404).json({ message: "Service request not found" });
        res.json({ data: request });
    } catch (error) {
        res.status(500).json({ message: "Failed to get service request", error });
    }
};

// ─── Accept Service Request (Volunteer) ──────────────────────────────────────
export const acceptServiceRequest = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const volunteerId = req.user.id;

        const existing = await prisma.serviceRequest.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: "Service request not found" });
        if (existing.status !== "PENDING") return res.status(400).json({ message: "Only PENDING requests can be accepted" });

        const request = await prisma.serviceRequest.update({
            where: { id },
            data: { volunteerId, status: "ACCEPTED" },
            select: requestSelect,
        });

        res.json({ message: "Service request accepted", data: request });
    } catch (error) {
        res.status(500).json({ message: "Failed to accept service request", error });
    }
};

// ─── Complete Service Request ─────────────────────────────────────────────────
export const completeServiceRequest = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;

        const existing = await prisma.serviceRequest.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: "Service request not found" });
        if (existing.volunteerId !== userId) return res.status(403).json({ message: "Only the assigned volunteer can complete this request" });
        if (existing.status !== "ACCEPTED") return res.status(400).json({ message: "Only ACCEPTED requests can be completed" });

        const request = await prisma.serviceRequest.update({
            where: { id },
            data: { status: "COMPLETED" },
            select: requestSelect,
        });

        res.json({ message: "Service request completed", data: request });
    } catch (error) {
        res.status(500).json({ message: "Failed to complete service request", error });
    }
};

// ─── Cancel Service Request ───────────────────────────────────────────────────
export const cancelServiceRequest = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;

        const existing = await prisma.serviceRequest.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: "Service request not found" });

        const isOwner = existing.userId === userId;
        const isVolunteer = existing.volunteerId === userId;

        if (!isOwner && !isVolunteer && !req.user.isAdmin) {
            return res.status(403).json({ message: "Forbidden" });
        }
        if (existing.status === "COMPLETED" || existing.status === "CANCELLED") {
            return res.status(400).json({ message: `Cannot cancel a ${existing.status} request` });
        }

        const request = await prisma.serviceRequest.update({
            where: { id },
            data: { status: "CANCELLED" },
            select: requestSelect,
        });

        res.json({ message: "Service request cancelled", data: request });
    } catch (error) {
        res.status(500).json({ message: "Failed to cancel service request", error });
    }
};
