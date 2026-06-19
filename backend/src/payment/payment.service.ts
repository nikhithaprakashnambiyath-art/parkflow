import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentService implements OnModuleInit {
  private readonly logger = new Logger(PaymentService.name);
  private isDbAvailable = true;

  // In-memory payment logs fallback
  private runtimePayments: any[] = [];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.prisma.payment.count();
      this.logger.log('Prisma DB connection is active for Payments.');
    } catch (error) {
      this.logger.warn(`Prisma DB connection failed for Payments: ${error.message}. Using in-memory fallback.`);
      this.isDbAvailable = false;
    }
  }

  async createPayment(body: any) {
    const { bookingId, amount, transactionId, method, status } = body;
    if (!bookingId || !amount) {
      throw new BadRequestException('bookingId and amount are required');
    }

    const resolvedStatus = status || 'COMPLETED';

    if (this.isDbAvailable) {
      try {
        // Create payment record
        const payment = await this.prisma.payment.create({
          data: {
            bookingId,
            stripeChargeId: transactionId || `mock-tx-${Date.now()}`,
            amount,
            status: resolvedStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
          },
        });

        // If payment completed, update booking status
        if (resolvedStatus === 'COMPLETED') {
          await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'PENDING' }, // status after payment is PENDING check-in
          });
        }

        return payment;
      } catch (err: any) {
        this.logger.error(`Failed to record payment in DB: ${err.message}. Falling back.`);
      }
    }

    const newPayment = {
      id: `mock-payment-${Date.now()}`,
      bookingId,
      stripeChargeId: transactionId || `mock-tx-${Date.now()}`,
      amount,
      status: resolvedStatus,
      method: method || 'CARD',
      createdAt: new Date(),
    };
    this.runtimePayments.push(newPayment);
    return newPayment;
  }
}
