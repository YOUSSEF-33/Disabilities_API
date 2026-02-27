import type { Request, Response } from 'express';
import { prisma } from '@/lib/prisma';

export const addReview = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id; // Assuming user is injected by auth middleware
        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { rating, comment, volunteerId, serviceRequestId, appointmentId } = req.body;

        // Validate request
        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ message: 'Rating must be between 1 and 5' });
            return;
        }
        if (!volunteerId) {
            res.status(400).json({ message: 'Volunteer ID is required' });
            return;
        }
        if (!serviceRequestId && !appointmentId) {
            res.status(400).json({ message: 'Must provide either serviceRequestId or appointmentId' });
            return;
        }

        // Verify that the service/appointment was completed
        if (serviceRequestId) {
            const request = await prisma.serviceRequest.findUnique({ where: { id: serviceRequestId } });
            if (!request || request.status !== 'COMPLETED' || request.userId !== userId) {
                res.status(400).json({ message: 'Service request not eligible for review or not owned by you' });
                return;
            }
            const existing = await prisma.review.findUnique({ where: { serviceRequestId } });
            if (existing) {
                res.status(400).json({ message: 'Review already exists for this service request' });
                return;
            }
        } else if (appointmentId) {
            const appointment = await prisma.appointment.findUnique({ where: { id: appointmentId } });
            if (!appointment || appointment.status !== 'COMPLETED' || appointment.userId !== userId) {
                res.status(400).json({ message: 'Appointment not eligible for review or not owned by you' });
                return;
            }
            const existing = await prisma.review.findUnique({ where: { appointmentId } });
            if (existing) {
                res.status(400).json({ message: 'Review already exists for this appointment' });
                return;
            }
        }

        // Create the review
        const review = await prisma.review.create({
            data: {
                rating,
                comment,
                reviewerId: userId,
                volunteerId,
                serviceRequestId,
                appointmentId,
            },
        });

        // Recalculate volunteer average rating
        const aggregations = await prisma.review.aggregate({
            where: { volunteerId },
            _avg: { rating: true },
            _count: { rating: true },
        });

        await prisma.volunteerProfile.update({
            where: { id: volunteerId },
            data: {
                averageRating: aggregations._avg.rating || 0,
                reviewCount: aggregations._count.rating || 0,
            },
        });

        res.status(201).json({ message: 'Review created successfully', review });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Error adding review' });
    }
};

export const getVolunteerReviews = async (req: Request, res: Response): Promise<void> => {
    try {
        const volunteerId = parseInt(req.params.id as string);
        if (isNaN(volunteerId)) {
            res.status(400).json({ message: 'Invalid volunteer ID' });
            return;
        }

        const reviews = await prisma.review.findMany({
            where: { volunteerId },
            include: {
                reviewer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Error fetching reviews' });
    }
};
