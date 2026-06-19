import { Injectable, OnModuleInit, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewService implements OnModuleInit {
  private readonly logger = new Logger(ReviewService.name);
  private isDbAvailable = true;

  // In-memory fallback
  private runtimeReviews: any[] = [];
  private serviceReviews: any[] = [];

  constructor(private readonly prisma: PrismaService) {
    const now = new Date();
    this.serviceReviews.push(
      {
        id: 'mock-service-review-1',
        userId: 'mock-user-customer',
        rating: 5,
        comment: 'SmartPark has made parking in Kochi so simple! Extremely premium design and fast scans.',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
        user: { name: 'Alex Mercer' },
      },
      {
        id: 'mock-service-review-2',
        userId: 'mock-user-2',
        rating: 5,
        comment: 'Absolutely love the real-time slot selection grid and instant check-outs. Highly recommend!',
        createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        user: { name: 'Priya Nair' },
      },
    );
  }

  async onModuleInit() {
    try {
      // Attempt a lightweight DB probe
      await (this.prisma as any).$queryRaw`SELECT 1`;
      this.logger.log('Prisma DB connection is active for Reviews.');
    } catch (error) {
      this.logger.warn(
        `Prisma DB connection failed for Reviews: ${error.message}. Using in-memory fallback.`,
      );
      this.isDbAvailable = false;
      this.seedRuntimeData();
    }
  }

  private seedRuntimeData() {
    const now = new Date();

    this.runtimeReviews.push(
      {
        id: 'mock-review-1',
        userId: 'mock-user-customer',
        bookingId: 'mock-booking-past-1',
        lotId: 'mock-uuid-4',
        rating: 4,
        comment: 'Great experience! Easy to find the spot and the gate system worked flawlessly.',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        user: { name: 'Alex Mercer', email: 'user@smartpark.io' },
        lot: { name: 'MG Road Secure Parking', location: 'MG Road, Kochi' },
      },
      {
        id: 'mock-review-2',
        userId: 'mock-user-2',
        bookingId: 'mock-booking-2',
        lotId: 'mock-uuid-1',
        rating: 5,
        comment: 'Excellent parking facility. Clean, safe and the QR code entry/exit is super smooth!',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        user: { name: 'Priya Nair', email: 'priya@example.com' },
        lot: { name: 'Lulu Mall Smart Lot', location: 'Edappally, Kochi' },
      },
      {
        id: 'mock-review-3',
        userId: 'mock-user-3',
        bookingId: 'mock-booking-3',
        lotId: 'mock-uuid-1',
        rating: 3,
        comment: 'Decent parking but the slots were a bit cramped. Good security though.',
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
        user: { name: 'Rahul Menon', email: 'rahul@example.com' },
        lot: { name: 'Lulu Mall Smart Lot', location: 'Edappally, Kochi' },
      },
    );
  }

  private async updateLotRating(lotId: string) {
    try {
      const ratingSummary = await this.prisma.review.aggregate({
        where: { lotId },
        _avg: { rating: true },
      });

      const averageRating = ratingSummary._avg.rating;
      if (averageRating === null) return;

      await this.prisma.parkingLot.update({
        where: { id: lotId },
        data: { rating: Number(averageRating.toFixed(1)) },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to refresh parking lot rating: ${err.message}`);
    }
  }

  async submitReview(userId: string, data: { bookingId: string; lotId: string; rating: number; comment: string }) {
    const { bookingId, lotId, rating, comment } = data;

    if (!bookingId || !lotId || !rating || rating < 1 || rating > 5) {
      throw new BadRequestException('bookingId, lotId, and a rating between 1-5 are required');
    }

    if (this.isDbAvailable) {
      try {
        const booking = await this.prisma.booking.findFirst({
          where: { id: bookingId, userId },
          include: { slot: true },
        });
        if (!booking) {
          throw new NotFoundException('Booking not found');
        }

        const resolvedLotId = booking.slot.lotId || lotId;
        const existing = await this.prisma.review.findFirst({
          where: { userId, lotId: resolvedLotId },
        });
        if (existing) {
          throw new BadRequestException('You have already reviewed this parking lot.');
        }

        const review = await this.prisma.review.create({
          data: { userId, lotId: resolvedLotId, rating, comment },
          include: { user: { select: { name: true, email: true } }, lot: { select: { name: true, location: true } } },
        });
        await this.updateLotRating(resolvedLotId);
        return review;
      } catch (err: any) {
        if (err instanceof BadRequestException || err instanceof NotFoundException) throw err;
        this.logger.warn(`DB review submit failed: ${err.message}. Using in-memory.`);
      }
    }

    // In-memory fallback
    const alreadyReviewed = this.runtimeReviews.find(r => r.bookingId === bookingId && r.userId === userId);
    if (alreadyReviewed) {
      throw new BadRequestException('You have already reviewed this booking.');
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

  async getReviewsForLot(lotId: string) {
    if (this.isDbAvailable) {
      try {
        const reviews = await this.prisma.review.findMany({
          where: { lotId },
          include: { user: { select: { name: true, email: true } } },
          orderBy: { createdAt: 'desc' },
        });
        return reviews;
      } catch (err: any) {
        this.logger.warn(`DB reviews fetch failed: ${err.message}. Using in-memory.`);
      }
    }
    return this.runtimeReviews.filter(r => r.lotId === lotId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getMyReviews(userId: string) {
    if (this.isDbAvailable) {
      try {
        const reviews = await this.prisma.review.findMany({
          where: { userId },
          include: { lot: { select: { name: true, location: true } } },
          orderBy: { createdAt: 'desc' },
        });
        return reviews;
      } catch (err: any) {
        this.logger.warn(`DB my reviews fetch failed: ${err.message}. Using in-memory.`);
      }
    }
    return this.runtimeReviews.filter(r => r.userId === userId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async hasReviewed(userId: string, bookingId: string): Promise<boolean> {
    if (this.isDbAvailable) {
      try {
        const booking = await this.prisma.booking.findFirst({
          where: { id: bookingId, userId },
          include: { slot: true },
        });
        if (!booking) return false;

        const existing = await this.prisma.review.findFirst({
          where: { userId, lotId: booking.slot.lotId },
        });
        return !!existing;
      } catch {}
    }
    return !!this.runtimeReviews.find(r => r.bookingId === bookingId && r.userId === userId);
  }

  async submitServiceReview(userId: string, rating: number, comment: string) {
    if (!rating || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    let userName = 'Anonymous';
    if (this.isDbAvailable) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { name: true },
        });
        if (user) userName = user.name;
      } catch (err: any) {
        this.logger.warn(`Failed to fetch user name: ${err.message}`);
      }
    } else {
      if (userId === 'mock-user-customer') {
        userName = 'Alex Mercer';
      } else if (userId === 'mock-user-admin') {
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
}
