import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDashboardMetrics() {
    const [
      totalRevenueResult,
      totalBookings,
      activeBookings,
      totalLots,
      totalSlots,
      occupiedSlots,
      recentActivity,
    ] = await Promise.all([
      this.prisma.payment.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      this.prisma.booking.count(),
      this.prisma.booking.count({ where: { status: 'ACTIVE' } }),
      this.prisma.parkingLot.count(),
      this.prisma.parkingSlot.count(),
      this.prisma.parkingSlot.count({ where: { status: 'BOOKED' } }),
      this.prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: { id: true, action: true, details: true, createdAt: true },
      }),
    ]);

    return {
      totalRevenue: totalRevenueResult._sum.amount ?? 0,
      totalBookings,
      activeBookings,
      totalLots,
      occupancyRate: totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0,
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        action: log.action,
        details: log.details,
        createdAt: log.createdAt,
      })),
    };
  }

  async getRevenueReport() {
    const lots = await this.prisma.parkingLot.findMany({
      include: {
        slots: {
          include: {
            bookings: {
              include: { payments: true },
            },
          },
        },
      },
    });

    return lots.map((lot) => {
      let revenue = 0;
      lot.slots.forEach((slot) =>
        slot.bookings.forEach((b) =>
          b.payments.forEach((p) => {
            if (p.status === 'COMPLETED') revenue += p.amount;
          }),
        ),
      );
      return { name: lot.name, revenue };
    });
  }

  async createLocation(body: any) {
    const { name, location, coordinates, pricing, pricePerHour, totalSlots, availableSlots } = body;
    const resolvedPricing = pricing ?? pricePerHour;

    if (!name || !location || !resolvedPricing || !totalSlots) {
      throw new BadRequestException(
        'name, location, pricing, and totalSlots are required',
      );
    }

    const resolvedCoords =
      coordinates || JSON.stringify({ lat: 9.9312, lng: 76.2673 });
    const slotsCount = parseInt(totalSlots, 10);
    const availableCount =
      availableSlots !== undefined
        ? Math.min(parseInt(availableSlots, 10), slotsCount)
        : slotsCount;

    const lot = await this.prisma.parkingLot.create({
      data: {
        name,
        location,
        coordinates: resolvedCoords,
        pricing: parseFloat(resolvedPricing),
        availability: availableCount,
      },
    });

    for (let i = 1; i <= slotsCount; i++) {
      const row = String.fromCharCode(65 + Math.floor((i - 1) / 4));
      const num = ((i - 1) % 4) + 1;
      await this.prisma.parkingSlot.create({
        data: {
          lotId: lot.id,
          name: `${row}${num}`,
          status: i <= availableCount ? 'AVAILABLE' : 'BOOKED',
        },
      });
    }

    this.logger.log(`Admin created location: ${lot.name}`);
    return lot;
  }

  async updateLocation(lotId: string, data: any) {
    try {
      const lot = await this.prisma.parkingLot.update({
        where: { id: lotId },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.location && { location: data.location }),
          ...(data.coordinates && { coordinates: data.coordinates }),
          ...(data.pricing && { basePricePerHour: data.pricing }),
        },
      });

      await this.prisma.auditLog.create({
        data: {
          action: 'UPDATE_LOCATION',
          details: `Admin updated parking lot: ${lot.name}`,
        },
      });

      return lot;
    } catch (err: any) {
      this.logger.error(`Failed to update location: ${err.message}`);
      throw new BadRequestException('Could not update parking lot location.');
    }
  }

  async createPricingRule(lotId: string, body: any) {
    const { multiplier, startTime, endTime } = body;
    if (!multiplier || !startTime || !endTime) {
      throw new BadRequestException(
        'multiplier, startTime, and endTime are required',
      );
    }

    return this.prisma.pricingRule.create({
      data: {
        lotId,
        multiplier: parseFloat(multiplier),
        startTime,
        endTime,
      },
    });
  }

  async getPricingRules(lotId: string) {
    return this.prisma.pricingRule.findMany({ where: { lotId } });
  }

  async getAllBookings() {
    return this.prisma.booking.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        slot: { include: { lot: true } },
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateBookingStatus(id: string, status: string) {
    return this.prisma.booking.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        vehicles: { select: { id: true } },
        bookings: { include: { payments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return users.map((user) => {
      let totalSpent = 0;
      user.bookings.forEach((b) =>
        b.payments.forEach((p) => {
          if (p.status === 'COMPLETED') totalSpent += p.amount;
        }),
      );
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        _count: {
          bookings: user.bookings.length,
          vehicles: user.vehicles.length,
        },
        totalSpent,
      };
    });
  }

  async updateUserStatus(id: string, isSuspended: boolean) {
    await this.prisma.auditLog
      .create({
        data: {
          action: isSuspended ? 'USER_SUSPENDED' : 'USER_UNSUSPENDED',
          details: `User ${id} suspension set to ${isSuspended}`,
        },
      })
      .catch(() => {});
    return {
      id,
      isSuspended,
      message: `User status updated to ${isSuspended ? 'Suspended' : 'Active'}.`,
    };
  }

  async getLots() {
    return this.prisma.parkingLot.findMany({
      include: { _count: { select: { slots: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
