import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class ReviewService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private isDbAvailable;
    private runtimeReviews;
    private serviceReviews;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private seedRuntimeData;
    private updateLotRating;
    submitReview(userId: string, data: {
        bookingId: string;
        lotId: string;
        rating: number;
        comment: string;
    }): Promise<{
        user: {
            name: string;
            email: string;
        };
        lot: {
            name: string;
            location: string;
        };
    } & {
        id: string;
        rating: number;
        lotId: string;
        createdAt: Date;
        userId: string;
        comment: string | null;
    }>;
    getReviewsForLot(lotId: string): Promise<any[]>;
    getMyReviews(userId: string): Promise<any[]>;
    hasReviewed(userId: string, bookingId: string): Promise<boolean>;
    submitServiceReview(userId: string, rating: number, comment: string): Promise<{
        id: string;
        userId: string;
        rating: number;
        comment: string;
        createdAt: Date;
        user: {
            name: string;
        };
    }>;
    getServiceReviews(): Promise<any[]>;
}
