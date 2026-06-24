import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewService {
  private readonly logger = new Logger(ReviewService.name);

  // In-memory service-level testimonials (not lot reviews, separate concept)
  private readonly serviceTestimonials = [
    {
      id: 'testimonial-1',
      rating: 5,
      comment: 'ParkFlow AI has made parking so simple! Premium design and fast scans.',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      user: { name: 'Alex Mercer' },
    },
    {
      id: 'testimonial-2',
      rating: 5,
      comment: 'Love the real-time slot selection grid and instant check-outs. Highly recommend!',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      user: { name: 'Priya Nair' },
    },
  ];
  private userServiceReviews: any[] = [];

  constructor(private readonly prisma: PrismaService) {}

  private async updateLotRating(lotId: string) {
    try {
      const summary = await this.prisma.review.aggregate({
        where: { lotId },
        _avg: { rating: true },
      });
      if (summary._avg.rating === null) return;
      await this.prisma.parkingLot.update({
        where: { id: lotId },
        data: { rating: Number(summary._avg.rating.toFixed(1)) },
      });
    } catch (err: any) {
      this.logger.warn(`Failed to update lot rating: ${err.message}`);
    }
  }

  async submitReview(
    userId: string,
    data: {
      bookingId: string;
      lotId: string;
      rating: number;
      comment?: string;
    },
  ) {
    const { bookingId, lotId, rating, comment } = data;

    if (!bookingId || !lotId || !rating || rating < 1 || rating > 5) {
      throw new BadRequestException(
        'bookingId, lotId, and a rating between 1–5 are required',
      );
    }

    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: { slot: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const resolvedLotId = booking.slot.lotId || lotId;

    const existing = await this.prisma.review.findFirst({
      where: { userId, lotId: resolvedLotId },
    });
    if (existing) {
      throw new BadRequestException(
        'You have already reviewed this parking lot.',
      );
    }

    const review = await this.prisma.review.create({
      data: { userId, lotId: resolvedLotId, rating, comment: comment || '' },
      include: {
        user: { select: { name: true, email: true } },
        lot: { select: { name: true, location: true } },
      },
    });

    await this.updateLotRating(resolvedLotId);
    this.logger.log(`Review ${review.id} submitted for lot ${resolvedLotId}`);
    return review;
  }

  async getReviewsForLot(lotId: string) {
    return this.prisma.review.findMany({
      where: { lotId },
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getMyReviews(userId: string) {
    return this.prisma.review.findMany({
      where: { userId },
      include: { lot: { select: { name: true, location: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async hasReviewed(userId: string, bookingId: string): Promise<boolean> {
    const booking = await this.prisma.booking.findFirst({
      where: { id: bookingId, userId },
      include: { slot: true },
    });
    if (!booking) return false;

    const existing = await this.prisma.review.findFirst({
      where: { userId, lotId: booking.slot.lotId },
    });
    return !!existing;
  }

  async submitServiceReview(userId: string, rating: number, comment: string) {
    if (!rating || rating < 1 || rating > 5) {
      throw new BadRequestException('Rating must be between 1 and 5');
    }

    let userName = 'Anonymous';
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      if (user) userName = user.name;
    } catch {}

    const review = {
      id: `service-review-${Date.now()}`,
      userId,
      rating,
      comment: comment || '',
      createdAt: new Date(),
      user: { name: userName },
    };
    this.userServiceReviews.push(review);
    return review;
  }

  async getServiceReviews() {
    const all = [...this.serviceTestimonials, ...this.userServiceReviews];
    return all.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
