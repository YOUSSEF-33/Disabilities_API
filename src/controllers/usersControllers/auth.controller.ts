import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/utils/bcrypt";
import { hashPassword } from "@/utils/bcrypt";
import { generateToken } from "@/utils/jwt";
import type { Request, Response } from "express";

export const register = async (req: Request, res: Response) => {
    try {
        const {
            email,
            phoneNumber,
            firstName,
            lastName,
            username,
            password,
            disabilityType,
            disabilityDetails,
            isVolunteer,
        } = req.body;

        if (!email || !phoneNumber || !firstName || !lastName || !username || !password) {
            return res.status(400).json({ message: "All required fields must be provided" });
        }

        const hashedPassword = await hashPassword(password);

        const user = await prisma.user.create({
            data: {
                email,
                phoneNumber,
                firstName,
                lastName,
                username,
                password: hashedPassword,
                disabilityType: disabilityType ?? null,
                disabilityDetails: disabilityDetails ?? null,
                isVolunteer: isVolunteer ?? false,
            },
            select: {
                id: true,
                email: true,
                phoneNumber: true,
                firstName: true,
                lastName: true,
                username: true,
                isAdmin: true,
                disabilityType: true,
                disabilityDetails: true,
                isVolunteer: true,
                createdAt: true,
            },
        });

        const token = generateToken({
            id: user.id,
            email: user.email,
            username: user.username,
        });

        res.status(201).json({ message: "User registered successfully", accessToken: token, user });
    } catch (error: any) {
        if (error.code === "P2002") {
            return res.status(409).json({ message: "Email, phone number, or username already in use" });
        }
        return res.status(500).json({ message: "Failed to register", error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = generateToken({
            id: user.id,
            email: user.email,
            username: user.username,
        });

        res.json({ message: "User logged in successfully", accessToken: token });
    } catch (error) {
        return res.status(500).json({ message: "Failed to login", error });
    }
};
