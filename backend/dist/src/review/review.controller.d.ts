import { ReviewService } from './review.service';
export declare class ReviewController {
    private readonly reviewService;
    constructor(reviewService: ReviewService);
    submitReview(req: any, body: any): Promise<{
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
    getMyReviews(req: any): Promise<any[]>;
    hasReviewed(req: any, bookingId: string): Promise<{
        reviewed: boolean;
    }>;
    submitServiceReview(req: any, body: any): Promise<{
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
