import { prisma } from "@/lib/prisma";
import type { Request, Response } from "express";

// ─── Add New Location ──────────────────────────────────────────────────────
export const createLocation = async (req: Request, res: Response) => {
    try {
        const { name, address, latitude, longitude } = req.body;

        if (!name || !address || latitude === undefined || longitude === undefined) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const location = await prisma.location.create({
            data: {
                name,
                address,
                latitude,
                longitude,
            },
        });

        res.status(201).json({ message: "Location created", data: location });
    } catch (error) {
        res.status(500).json({ message: "Failed to create location", error });
    }
};

// ─── Get All Locations ──────────────────────────────────────────────────────
export const getAllLocations = async (req: Request, res: Response) => {
    try {
        const locations = await prisma.location.findMany({
            include: {
                features: true,
            },
        });

        res.json({ data: locations });
    } catch (error) {
        res.status(500).json({ message: "Failed to get locations", error });
    }
};

// ─── Get Location By ID ─────────────────────────────────────────────────────
export const getLocationById = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id);
        const location = await prisma.location.findUnique({
            where: { id },
            include: {
                features: true,
            },
        });

        if (!location) return res.status(404).json({ message: "Location not found" });

        res.json({ data: location });
    } catch (error) {
        res.status(500).json({ message: "Failed to get location", error });
    }
};

// ─── Add Accessibility Feature to Location ──────────────────────────────────
export const addAccessibilityFeature = async (req: Request, res: Response) => {
    try {
        const locationId = Number(req.params.id);
        const { type, description, rating } = req.body;

        if (!type) {
            return res.status(400).json({ message: "Feature type is required" });
        }

        const feature = await prisma.accessibilityFeature.create({
            data: {
                locationId,
                type,
                description,
                rating: rating ?? 0,
            },
        });

        res.status(201).json({ message: "Accessibility feature added", data: feature });
    } catch (error) {
        res.status(500).json({ message: "Failed to add accessibility feature", error });
    }
};

// ─── Search Locations by Name or Address ────────────────────────────────────
export const searchLocations = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;

        if (!query) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const locations = await prisma.location.findMany({
            where: {
                OR: [
                    { name: { contains: String(query), mode: 'insensitive' } },
                    { address: { contains: String(query), mode: 'insensitive' } },
                ],
            },
            include: {
                features: true,
            },
        });

        res.json({ data: locations });
    } catch (error) {
        res.status(500).json({ message: "Search failed", error });
    }
};
