import { prisma } from "@/lib/prisma";
import type { Request, Response } from "express";

// ─── Add Emergency Contact ──────────────────────────────────────────────────
export const addEmergencyContact = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { name, phoneNumber } = req.body;

        if (!name || !phoneNumber) {
            return res.status(400).json({ message: "Name and phone number are required" });
        }

        const contact = await prisma.emergencyContact.create({
            data: {
                name,
                phoneNumber,
                userId,
            },
        });

        res.status(201).json({ message: "Emergency contact added", data: contact });
    } catch (error) {
        res.status(500).json({ message: "Failed to add emergency contact", error });
    }
};

// ─── Get Emergency Contacts ────────────────────────────────────────────────
export const getEmergencyContacts = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const contacts = await prisma.emergencyContact.findMany({
            where: { userId },
        });

        res.json({ data: contacts });
    } catch (error) {
        res.status(500).json({ message: "Failed to get emergency contacts", error });
    }
};

// ─── Trigger SOS Alert ──────────────────────────────────────────────────────
export const triggerSOSAlert = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { latitude, longitude } = req.body;

        if (latitude === undefined || longitude === undefined) {
            return res.status(400).json({ message: "Latitude and longitude are required" });
        }

        const alert = await prisma.sOSAlert.create({
            data: {
                userId,
                latitude,
                longitude,
                status: "ACTIVE",
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                    },
                },
            },
        });

        // In a real app, we would send SMS/Notifications to emergency contacts here

        res.status(201).json({ message: "SOS Alert triggered!", data: alert });
    } catch (error) {
        res.status(500).json({ message: "Failed to trigger SOS alert", error });
    }
};

// ─── Get Active SOS Alerts (Admin/Volunteers) ──────────────────────────────
export const getActiveSOSAlerts = async (req: Request, res: Response) => {
    try {
        const alerts = await prisma.sOSAlert.findMany({
            where: { status: "ACTIVE" },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        phoneNumber: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        res.json({ data: alerts });
    } catch (error) {
        res.status(500).json({ message: "Failed to get SOS alerts", error });
    }
};

// ─── Resolve SOS Alert ──────────────────────────────────────────────────────
export const resolveSOSAlert = async (req: Request, res: Response) => {
    try {
        const alertId = Number(req.params.id);
        const alert = await prisma.sOSAlert.update({
            where: { id: alertId },
            data: { status: "RESOLVED" },
        });

        res.json({ message: "SOS Alert resolved", data: alert });
    } catch (error) {
        res.status(500).json({ message: "Failed to resolve SOS alert", error });
    }
};
