import { prisma } from "@/lib/prisma";
import type { Request, Response } from "express";

// ─── Get All Available Badges ───────────────────────────────────────────────
export const getAllBadges = async (req: Request, res: Response) => {
    try {
        const badges = await prisma.badge.findMany();
        res.json({ data: badges });
    } catch (error) {
        res.status(500).json({ message: "Failed to get badges", error });
    }
};

// ─── Get Volunteer Badges ──────────────────────────────────────────────────
export const getVolunteerBadges = async (req: Request, res: Response) => {
    try {
        const userId = Number(req.params.id);
        const badges = await prisma.volunteerBadge.findMany({
            where: { volunteerId: userId },
            include: {
                badge: true,
            },
        });

        res.json({ data: badges });
    } catch (error) {
        res.status(500).json({ message: "Failed to get volunteer badges", error });
    }
};

// ─── Award Badge to Volunteer (Admin only) ──────────────────────────────────
export const awardBadge = async (req: Request, res: Response) => {
    try {
        const { volunteerId, badgeId } = req.body;

        if (!volunteerId || !badgeId) {
            return res.status(400).json({ message: "Volunteer ID and Badge ID are required" });
        }

        const award = await prisma.volunteerBadge.upsert({
            where: {
                volunteerId_badgeId: {
                    volunteerId: Number(volunteerId),
                    badgeId: Number(badgeId),
                },
            },
            update: {}, // Already awarded
            create: {
                volunteerId: Number(volunteerId),
                badgeId: Number(badgeId),
            },
        });

        res.status(201).json({ message: "Badge awarded", data: award });
    } catch (error) {
        res.status(500).json({ message: "Failed to award badge", error });
    }
};

// ─── Create New Badge (Admin only) ──────────────────────────────────────────
export const createBadge = async (req: Request, res: Response) => {
    try {
        const { name, description, iconUrl } = req.body;

        if (!name || !description) {
            return res.status(400).json({ message: "Name and description are required" });
        }

        const badge = await prisma.badge.create({
            data: { name, description, iconUrl },
        });

        res.status(201).json({ message: "Badge created", data: badge });
    } catch (error) {
        res.status(500).json({ message: "Failed to create badge", error });
    }
};

// ─── Auto-Check and Award Milestones ────────────────────────────────────────
// This would be called after a service is completed or a review is given
export const checkMilestones = async (volunteerId: number) => {
    try {
        // Count completed service requests
        const serviceCount = await prisma.serviceRequest.count({
            where: { volunteerId, status: "COMPLETED" },
        });

        const milestones = [
            { name: "First Help", threshold: 1, description: "Awarded for completing your first service request." },
            { name: "Helping Hand", threshold: 5, description: "Awarded for completing 5 service requests." },
            { name: "Super Volunteer", threshold: 10, description: "Awarded for completing 10 service requests." },
        ];

        for (const milestone of milestones) {
            if (serviceCount >= milestone.threshold) {
                // Find or create the badge
                const badge = await prisma.badge.upsert({
                    where: { name: milestone.name },
                    update: {},
                    create: { name: milestone.name, description: milestone.description },
                });

                // Award to volunteer
                await prisma.volunteerBadge.upsert({
                    where: {
                        volunteerId_badgeId: {
                            volunteerId,
                            badgeId: badge.id,
                        },
                    },
                    update: {},
                    create: {
                        volunteerId,
                        badgeId: badge.id,
                    },
                });
            }
        }
    } catch (error) {
        console.error("Failed to check milestones:", error);
    }
};
