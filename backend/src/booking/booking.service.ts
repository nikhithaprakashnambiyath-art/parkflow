import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(private readonly prisma: PrismaService) {}

  // ── Slots ─────────────────────────────────────────────────────────────────

  async getSlots(lotId: string) {
    const slots = await this.prisma.parkingSlot.findMany({
      where: { lotId },
      include: {
        bookings: {
          where: { status: { in: ['PENDING', 'ACTIVE'] } },
          select: { startTime: true, endTime: true },
        },
      },
    });

    return slots.map((slot) => {
      const now = new Date();
      const isBookedNow = slot.bookings.some(
        (b) => b.startTime <= now && b.endTime >= now,
      );

      // Derive type and floor from slot name prefix (e.g. A1, B3, E7)
      const zone = slot.name ? slot.name.charAt(0).toUpperCase() : 'A';
      const zoneIndex = zone.charCodeAt(0) - 64; // A=1, B=2, C=3, ...
      let type: 'compact' | 'standard' | 'premium' = 'standard';
      if (zoneIndex <= 2) type = 'compact';
      else if (zoneIndex <= 4) type = 'standard';
      else type = 'premium';
      const floor = Math.max(1, Math.ceil(zoneIndex / 3));

      const rawStatus = slot.status === 'MAINTENANCE'
        ? 'MAINTENANCE'
        : isBookedNow
          ? 'BOOKED'
          : 'AVAILABLE';

      // Map backend status to frontend-friendly values
      const statusMap: Record<string, string> = {
        AVAILABLE: 'available',
        BOOKED: 'occupied',
        MAINTENANCE: 'reserved',
      };

      return {
        id: slot.id,
        lotId: slot.lotId,
        name: slot.name,
        slotNumber: slot.name,
        type,
        floor,
        zone,
        hasEVCharging: (parseInt(slot.name?.slice(1) || '0', 10) % 5) === 0,
        isCovered: zoneIndex > 1,
        status: statusMap[rawStatus] ?? 'available',
      };
    });
  }

  // ── Booking History ───────────────────────────────────────────────────────

  async getBookingHistory(userId: string) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        slot: { include: { lot: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Booking Details ───────────────────────────────────────────────────────

  async getBookingDetails(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        slot: { include: { lot: true } },
        payments: true,
        sessions: true,
      },
    });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  // ── Create Booking ────────────────────────────────────────────────────────

  async createBooking(
    userId: string,
    data: {
      slotId: string;
      startTimeStr: string;
      endTimeStr: string;
      amount: number;
    },
  ) {
    const { slotId, startTimeStr, endTimeStr, amount } = data;

    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    // Conflict check
    const conflicts = await this.prisma.booking.count({
      where: {
        slotId,
        status: { in: ['PENDING', 'ACTIVE'] },
        OR: [
          { startTime: { lte: startTime }, endTime: { gte: startTime } },
          { startTime: { lte: endTime }, endTime: { gte: endTime } },
          { startTime: { gte: startTime }, endTime: { lte: endTime } },
        ],
      },
    });

    if (conflicts > 0) {
      throw new BadRequestException(
        'This slot is already booked for the selected time window.',
      );
    }

    const booking = await this.prisma.booking.create({
      data: { userId, slotId, startTime, endTime, amount, status: 'PENDING' },
      include: { slot: { include: { lot: true } } },
    });

    // Booking confirmation notification (best-effort)
    await this.prisma.notification
      .create({
        data: {
          userId,
          type: 'CONFIRMATION',
          message: `Booking confirmed at ${booking.slot.lot.name}. Slot: ${booking.slot.name}.`,
        },
      })
      .catch(() => {});

    this.logger.log(`Booking created: ${booking.id} for user ${userId}`);
    return booking;
  }

  // ── Cancel Booking ────────────────────────────────────────────────────────

  async cancelBooking(userId: string, id: string) {
    const booking = await this.prisma.booking.findFirst({
      where: { id, userId },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (booking.status === 'ACTIVE' || booking.status === 'COMPLETED') {
      throw new BadRequestException(
        'Cannot cancel an active or completed booking',
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    await this.prisma.notification
      .create({
        data: {
          userId,
          type: 'CANCEL',
          message: `Booking #${id.substring(0, 8)} has been cancelled.`,
        },
      })
      .catch(() => {});

    return updated;
  }

  // ── Simulate Gate Scan ────────────────────────────────────────────────────

  async simulateScan(body: { bookingId: string; action: 'ENTRY' | 'EXIT' }) {
    const { bookingId, action } = body;

    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { slot: { include: { lot: true } } },
    });

    if (!booking) throw new NotFoundException('Booking not found');

    if (action === 'ENTRY') {
      if (booking.status !== 'PENDING') {
        throw new BadRequestException(
          `Cannot check in: booking status is ${booking.status}`,
        );
      }

      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'ACTIVE' },
      });

      await this.prisma.parkingSession.create({
        data: {
          bookingId,
          userId: booking.userId,
          entryTime: new Date(),
          status: 'ACTIVE',
        },
      });

      await this.prisma.auditLog
        .create({
          data: {
            userId: booking.userId,
            action: 'GATE_ENTRY',
            details: `Entry at ${booking.slot.lot.name}, slot ${booking.slot.name}`,
          },
        })
        .catch(() => {});

      await this.prisma.notification
        .create({
          data: {
            userId: booking.userId,
            type: 'GATE_ENTRY',
            message: `Check-in successful! Park at slot ${booking.slot.name} in ${booking.slot.lot.name}.`,
          },
        })
        .catch(() => {});

      return { success: true, status: 'ACTIVE', message: 'Gate opened. Entry recorded.' };
    } else {
      if (booking.status !== 'ACTIVE') {
        throw new BadRequestException(
          `Cannot check out: booking status is ${booking.status}`,
        );
      }

      await this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'COMPLETED' },
      });

      const session = await this.prisma.parkingSession.findFirst({
        where: { bookingId, status: 'ACTIVE' },
      });

      if (session) {
        await this.prisma.parkingSession.update({
          where: { id: session.id },
          data: { exitTime: new Date(), status: 'COMPLETED' },
        });
      }

      await this.prisma.auditLog
        .create({
          data: {
            userId: booking.userId,
            action: 'GATE_EXIT',
            details: `Exit at ${booking.slot.lot.name}, slot ${booking.slot.name}`,
          },
        })
        .catch(() => {});

      await this.prisma.notification
        .create({
          data: {
            userId: booking.userId,
            type: 'GATE_EXIT',
            message: `Check-out successful! Thank you for parking at ${booking.slot.lot.name}.`,
          },
        })
        .catch(() => {});

      return { success: true, status: 'COMPLETED', message: 'Gate opened. Exit recorded.' };
    }
  }
}
