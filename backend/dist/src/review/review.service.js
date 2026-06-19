"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ReviewService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewService = ReviewService_1 = class ReviewService {
    prisma;
    logger = new common_1.Logger(ReviewService_1.name);
    isDbAvailable = true;
    runtimeReviews = [];
    serviceReviews = [];
    constructor(prisma) {
        this.prisma = prisma;
        const now = new Date();
        this.serviceReviews.push({
            id: 'mock-service-review-1',
            userId: 'mock-user-customer',
            rating: 5,
            comment: 'SmartPark has made parking in Kochi so simple! Extremely premium design and fast scans.',
            createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
            user: { name: 'Alex Mercer' },
        }, {
            id: 'mock-service-review-2',
            userId: 'mock-user-2',
            rating: 5,
            comment: 'Absolutely love the real-time slot selection grid and instant check-outs. Highly recommend!',
            createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
            user: { name: 'Priya Nair' },
        });
    }
    async onModuleInit() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            this.logger.log('Prisma DB connection is active for Reviews.');
        }
        catch (error) {
            this.logger.warn(`Prisma DB connection failed for Reviews: ${error.message}. Using in-memory fallback.`);
            this.isDbAvailable = false;
            this.seedRuntimeData();
        }
    }
    seedRuntimeData() {
        const now = new Date();
        this.runtimeReviews.push({
            id: 'mock-review-1',
            userId: 'mock-user-customer',
            bookingId: 'mock-booking-past-1',
            lotId: 'mock-uuid-4',
            rating: 4,
            comment: 'Great experience! Easy to find the spot and the gate system worked flawlessly.',
            createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
            user: { name: 'Alex Mercer', email: 'user@smartpark.io' },
            lot: { name: 'MG Road Secure Parking', location: 'MG Road, Kochi' },
        }, {
            id: 'mock-review-2',
            userId: 'mock-user-2',
            bookingId: 'mock-booking-2',
            lotId: 'mock-uuid-1',
            rating: 5,
            comment: 'Excellent parking facility. Clean, safe and the QR code entry/exit is super smooth!',
            createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
            user: { name: 'Priya Nair', email: 'priya@example.com' },
            lot: { name: 'Lulu Mall Smart Lot', location: 'Edappally, Kochi' },
        }, {
            id: 'mock-review-3',
            userId: 'mock-user-3',
            bookingId: 'mock-booking-3',
            lotId: 'mock-uuid-1',
            rating: 3,
            comment: 'Decent parking but the slots were a bit cramped. Good security though.',
            createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
            user: { name: 'Rahul Menon', email: 'rahul@example.com' },
            lot: { name: 'Lulu Mall Smart Lot', location: 'Edappally, Kochi' },
        });
    }
    async updateLotRating(lotId) {
        try {
            const ratingSummary = await this.prisma.review.aggregate({
                where: { lotId },
                _avg: { rating: true },
            });
            const averageRating = ratingSummary._avg.rating;
            if (averageRating === null)
                return;
            await this.prisma.parkingLot.update({
                where: { id: lotId },
                data: { rating: Number(averageRating.toFixed(1)) },
            });
        }
        catch (err) {
            this.logger.warn(`Failed to refresh parking lot rating: ${err.message}`);
        }
    }
    async submitReview(userId, data) {
        const { bookingId, lotId, rating, comment } = data;
        if (!bookingId || !lotId || !rating || rating < 1 || rating > 5) {
            throw new common_1.BadRequestException('bookingId, lotId, and a rating between 1-5 are required');
        }
        if (this.isDbAvailable) {
            try {
                const booking = await this.prisma.booking.findFirst({
                    where: { id: bookingId, userId },
                    include: { slot: true },
                });
                if (!booking) {
                    throw new common_1.NotFoundException('Booking not found');
                }
                const resolvedLotId = booking.slot.lotId || lotId;
                const existing = await this.prisma.review.findFirst({
                    where: { userId, lotId: resolvedLotId },
                });
                if (existing) {
                    throw new common_1.BadRequestException('You have already reviewed this parking lot.');
                }
                const review = await this.prisma.review.create({
                    data: { userId, lotId: resolvedLotId, rating, comment },
                    include: { user: { select: { name: true, email: true } }, lot: { select: { name: true, location: true } } },
                });
                await this.updateLotRating(resolvedLotId);
                return review;
            }
            catch (err) {
                if (err instanceof common_1.BadRequestException || err instanceof common_1.NotFoundException)
                    throw err;
                this.logger.warn(`DB review submit failed: ${err.message}. Using in-memory.`);
            }
        }
        const alreadyReviewed = this.runtimeReviews.find(r => r.bookingId === bookingId && r.userId === userId);
        if (alreadyReviewed) {
            throw new common_1.BadRequestException('You have already reviewed this booking.');
        }
        const newReview = {
            id: `mock-review-${Date.now()}`,
            userId,
            bookingId,
            lotId,
            rating,
            comment: comment || '',
            createdAt: new Date(),
            user: { name: 'You', email: 'user@smartpark.io' },
            lot: { name: 'Parking Lot', location: 'Kochi, Kerala' },
        };
        this.runtimeReviews.push(newReview);
        return newReview;
    }
    async getReviewsForLot(lotId) {
        if (this.isDbAvailable) {
            try {
                const reviews = await this.prisma.review.findMany({
                    where: { lotId },
                    include: { user: { select: { name: true, email: true } } },
                    orderBy: { createdAt: 'desc' },
                });
                return reviews;
            }
            catch (err) {
                this.logger.warn(`DB reviews fetch failed: ${err.message}. Using in-memory.`);
            }
        }
        return this.runtimeReviews.filter(r => r.lotId === lotId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async getMyReviews(userId) {
        if (this.isDbAvailable) {
            try {
                const reviews = await this.prisma.review.findMany({
                    where: { userId },
                    include: { lot: { select: { name: true, location: true } } },
                    orderBy: { createdAt: 'desc' },
                });
                return reviews;
            }
            catch (err) {
                this.logger.warn(`DB my reviews fetch failed: ${err.message}. Using in-memory.`);
            }
        }
        return this.runtimeReviews.filter(r => r.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async hasReviewed(userId, bookingId) {
        if (this.isDbAvailable) {
            try {
                const booking = await this.prisma.booking.findFirst({
                    where: { id: bookingId, userId },
                    include: { slot: true },
                });
                if (!booking)
                    return false;
                const existing = await this.prisma.review.findFirst({
                    where: { userId, lotId: booking.slot.lotId },
                });
                return !!existing;
            }
            catch { }
        }
        return !!this.runtimeReviews.find(r => r.bookingId === bookingId && r.userId === userId);
    }
    async submitServiceReview(userId, rating, comment) {
        if (!rating || rating < 1 || rating > 5) {
            throw new common_1.BadRequestException('Rating must be between 1 and 5');
        }
        let userName = 'Anonymous';
        if (this.isDbAvailable) {
            try {
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: { name: true },
                });
                if (user)
                    userName = user.name;
            }
            catch (err) {
                this.logger.warn(`Failed to fetch user name: ${err.message}`);
            }
        }
        else {
            if (userId === 'mock-user-customer') {
                userName = 'Alex Mercer';
            }
            else if (userId === 'mock-user-admin') {
                userName = 'System Admin';
            }
        }
        const newReview = {
            id: `service-review-${Date.now()}`,
            userId,
            rating,
            comment: comment || '',
            createdAt: new Date(),
            user: { name: userName },
        };
        this.serviceReviews.push(newReview);
        return newReview;
    }
    async getServiceReviews() {
        return this.serviceReviews.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
};
exports.ReviewService = ReviewService;
exports.ReviewService = ReviewService = ReviewService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewService);
//# sourceMappingURL=review.service.js.map