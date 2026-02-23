import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/utils/bcrypt";
import bcrypt from "bcryptjs";
import type { Request, Response } from "express"

const selectedData = {
    id: true,
    email: true,
    phoneNumber: true,
    firstName: true,
    lastName: true,
    username: true,
    isAdmin: true,
    createdAt: true,
    updatedAt: true
}

export const getAllUsers = async (req: Request, res: Response) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Number(req.query.limit) || 10, 100);

    const skip = (page - 1) * limit;

    try {
        const [users, total] = await Promise.all([
            prisma.user.findMany({ select: selectedData, skip, take: limit }),
            prisma.user.count(),
        ]);
        res.status(200).json({
            data: users,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to get users", error });
    }

}


export const getUserById = async (req: Request, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: Number(req.params.id)
            },
            select: selectedData
        })
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to get user", error });
    }

}

export const createUser = async (req: Request, res: Response) => {
    const {
        email,
        phoneNumber,
        firstName,
        lastName,
        username,
        password,
        isAdmin
    } = req.body;
    const hashedPassword = await hashPassword(password);
    try {
        const user = await prisma.user.create({
            data: {
                email,
                phoneNumber,
                firstName,
                lastName,
                username,
                isAdmin,
                password: hashedPassword
            },
            select: selectedData
        });
        res.json(user);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to create user", error });
    }
}



export const updateUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const {
        email,
        phoneNumber,
        firstName,
        lastName,
        username,
        password,
        isAdmin
    } = req.body;

    try {
        const data = {
            email,
            phoneNumber,
            firstName,
            lastName,
            username,
            password,
            isAdmin
        }

        if (password) {
            data.password = await hashPassword(password);
        }

        const user = await prisma.user.update({
            where: {
                id
            },
            data,
            select: selectedData
        });

        res.status(200).json(user);

    } catch (error: any) {

        console.log(error);

        if (error.code == "P2002") {
            return res.status(400).json({ message: "User already exists" });
        }

        if (error.code == "P2025") {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(500).json({ message: "Failed to update user", error });
    }
}



export const deleteUser = async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    try {
        const user = await prisma.user.delete({
            where: {
                id
            }
        });
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
        console.log(error);
        if (error.code == "P2025") {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(500).json({ message: "Failed to delete user", error });
    }
}
