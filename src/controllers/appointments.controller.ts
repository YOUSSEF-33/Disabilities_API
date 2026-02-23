import { prisma } from "@/lib/prisma";
import type { Request, Response } from "express";

const appointmentSelect = {
    id: true,
    title: true,
    description: true,
    scheduledAt: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    user: { select: { id: true, firstName: true, lastName: true, email: true } },
    volunteer: { select: { id: true, firstName: true, lastName: true, email: true } },
};

// ─── Create Appointment ───────────────────────────────────────────────────────
export const createAppointment = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const { title, description, volunteerId, scheduledAt } = req.body;

        if (!title || !volunteerId || !scheduledAt) {
            return res.status(400).json({ message: "title, volunteerId, and scheduledAt are required" });
        }

        const volunteer = await prisma.volunteerProfile.findUnique({ where: { userId: Number(volunteerId) } });
        if (!volunteer) return res.status(404).json({ message: "Volunteer not found" });
        if (!volunteer.isAvailable) return res.status(400).json({ message: "Volunteer is not available" });

        const appointment = await prisma.appointment.create({
            data: {
                title,
                description: description ?? null,
                userId,
                volunteerId: Number(volunteerId),
                scheduledAt: new Date(scheduledAt),
            },
            select: appointmentSelect,
        });

        res.status(201).json({ message: "Appointment created", data: appointment });
    } catch (error) {
        res.status(500).json({ message: "Failed to create appointment", error });
    }
};

// ─── Get My Appointments ──────────────────────────────────────────────────────
export const getMyAppointments = async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Number(req.query.limit) || 10, 100);
        const skip = (page - 1) * limit;

        const where = {
            OR: [{ userId }, { volunteerId: userId }],
        };

        const [appointments, total] = await Promise.all([
            prisma.appointment.findMany({ where, skip, take: limit, select: appointmentSelect, orderBy: { scheduledAt: "asc" } }),
            prisma.appointment.count({ where }),
        ]);

        res.json({ data: appointments, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } });
    } catch (error) {
        res.status(500).json({ message: "Failed to get appointments", error });
    }
};

// ─── Get Appointment By ID ────────────────────────────────────────────────────
export const getAppointmentById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;

        const appointment = await prisma.appointment.findUnique({ where: { id }, select: appointmentSelect });
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });

        const isParticipant = appointment.user.id === userId || appointment.volunteer.id === userId;
        if (!isParticipant && !req.user.isAdmin) return res.status(403).json({ message: "Forbidden" });

        res.json({ data: appointment });
    } catch (error) {
        res.status(500).json({ message: "Failed to get appointment", error });
    }
};

// ─── Update Appointment Status ────────────────────────────────────────────────
export const updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const userId = req.user.id;
        const { status } = req.body;

        const validStatuses = ["CANCELLED", "COMPLETED"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: `status must be one of: ${validStatuses.join(", ")}` });
        }

        const existing = await prisma.appointment.findUnique({ where: { id } });
        if (!existing) return res.status(404).json({ message: "Appointment not found" });

        const isParticipant = existing.userId === userId || existing.volunteerId === userId;
        if (!isParticipant && !req.user.isAdmin) return res.status(403).json({ message: "Forbidden" });

        if (existing.status === "CANCELLED" || existing.status === "COMPLETED") {
            return res.status(400).json({ message: `Cannot change status of a ${existing.status} appointment` });
        }

        const appointment = await prisma.appointment.update({
            where: { id },
            data: { status },
            select: appointmentSelect,
        });

        res.json({ message: "Appointment status updated", data: appointment });
    } catch (error) {
        res.status(500).json({ message: "Failed to update appointment status", error });
    }
};
