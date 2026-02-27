import type { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

export const getConversationHistory = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const otherUserId = parseInt(req.params.userId as string);
        if (isNaN(otherUserId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: otherUserId },
                    { senderId: otherUserId, receiverId: userId },
                ],
            },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true } },
            },
            orderBy: { createdAt: 'asc' },
        });

        // Mark received messages as read
        await prisma.message.updateMany({
            where: {
                senderId: otherUserId,
                receiverId: userId,
                isRead: false,
            },
            data: { isRead: true },
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching conversation history:', error);
        res.status(500).json({ message: 'Error fetching conversation history' });
    }
};
