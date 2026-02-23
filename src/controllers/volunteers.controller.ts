import { prisma } from "@/lib/prisma";
import type { Request, Response } from "express";

// ─── Create / Upsert Volunteer Profile ───────────────────────────────────────
export const createVolunteerProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { skills, bio, isAvailable } = req.body;

        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({ message: "skills must be a non-empty array" });
        }

        // Mark user as volunteer
        await prisma.user.update({
            where: { id: userId },
            data: { isVolunteer: true },
        });

        const profile = await prisma.volunteerProfile.upsert({
            where: { userId },
            update: { skills, bio: bio ?? null, isAvailable: isAvailable ?? true },
            create: { userId, skills, bio: bio ?? null, isAvailable: isAvailable ?? true },
            include: { user: { select: { id: true, firstName: true, lastName: true, email: true } } },
        });

        res.status(201).json({ message: "Volunteer profile saved", data: profile });
    } catch (error) {
        res.status(500).json({ message: "Failed to save volunteer profile", error });
    }
};

// ─── Get All Volunteers ───────────────────────────────────────────────────────
export const getAllVolunteers = async (req: Request, res: Response) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Number(req.query.limit) || 10, 100);
        const skip = (page - 1) * limit;
        const available = req.query.available;

        const where = available !== undefined ? { isAvailable: available === "true" } : {};

        const [volunteers, total] = await Promise.all([
            prisma.volunteerProfile.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true },
                    },
                },
                orderBy: { createdAt: "desc" },
            }),
            prisma.volunteerProfile.count({ where }),
        ]);

        res.json({ data: volunteers, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        res.status(500).json({ message: "Failed to get volunteers", error });
    }
};

// ─── Get Volunteer By ID ──────────────────────────────────────────────────────
export const getVolunteerById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const volunteer = await prisma.volunteerProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, firstName: true, lastName: true, email: true, phoneNumber: true },
                },
            },
        });

        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });

        res.json({ data: volunteer });
    } catch (error) {
        res.status(500).json({ message: "Failed to get volunteer", error });
    }
};

// ─── Update Volunteer Profile ─────────────────────────────────────────────────
export const updateVolunteerProfile = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;
        const { skills, bio, isAvailable } = req.body;

        const existing = await prisma.volunteerProfile.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: "Volunteer profile not found" });
        if (existing.userId !== userId) return res.status(403).json({ message: "Forbidden" });

        const profile = await prisma.volunteerProfile.update({
            where: { id },
            data: {
                ...(skills !== undefined && { skills }),
                ...(bio !== undefined && { bio }),
                ...(isAvailable !== undefined && { isAvailable }),
            },
            include: { user: { select: { id: true, firstName: true, lastName: true } } },
        });

        res.json({ message: "Volunteer profile updated", data: profile });
    } catch (error) {
        res.status(500).json({ message: "Failed to update volunteer profile", error });
    }
};
