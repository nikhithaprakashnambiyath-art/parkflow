import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createPayment(body: {
    bookingId: string;
    amount: number;
    transactionId?: string;
    method?: string;
    status?: string;
  }) {
    const { bookingId, amount, transactionId, status } = body;

    if (!bookingId || !amount) {
      throw new BadRequestException('bookingId and amount are required');
    }

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
    });
    if (!booking) {
      throw new BadRequestException('Booking not found');
    }

    const paymentStatus =
      status === 'COMPLETED' ? ('COMPLETED' as const) : ('PENDING' as const);

    const payment = await this.prisma.payment.create({
      data: {
        bookingId,
        stripeChargeId: transactionId || `tx-${Date.now()}`,
        amount,
        status: paymentStatus,
      },
    });

    this.logger.log(
      `Payment ${payment.id} created for booking ${bookingId} — ${paymentStatus}`,
    );

    return payment;
  }

  async getPaymentsForBooking(bookingId: string) {
    return this.prisma.payment.findMany({
      where: { bookingId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
