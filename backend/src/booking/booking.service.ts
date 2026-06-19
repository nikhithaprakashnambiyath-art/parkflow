import {
  Injectable,
  OnModuleInit,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookingService implements OnModuleInit {
  private readonly logger = new Logger(BookingService.name);
  private isDbAvailable = true;

  // In-memory fallback stores
  private runtimeBookings: any[] = [];
  private runtimeSessions: any[] = [];
  private runtimeEntryLogs: any[] = [];

  // In-memory slot storage. Slots are mapped by lotId.
  private runtimeSlots: Map<string, any[]> = new Map();

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.prisma.booking.count();
      this.logger.log('Prisma DB connection is active for Bookings.');
    } catch (error) {
      this.logger.warn(
        `Prisma DB connection failed for Bookings: ${error.message}. Using in-memory fallback.`,
      );
      this.isDbAvailable = false;
      this.seedRuntimeData();
    }
  }

  private seedRuntimeData() {
    // Generate mock slots for the 20 mock lots (id: mock-uuid-1 to mock-uuid-20)
    for (let index = 1; index <= 20; index++) {
      const lotId = `mock-uuid-${index}`;
      const slots = [];

      // Create 40 slots organized by floor and type
      // Ground Floor (F0): 20 slots
      // First Floor (F1): 20 slots

      const floors = [0, 1];
      const zones = ['A', 'B', 'C', 'D'];
      const types = ['compact', 'standard', 'premium'];

      let slotCounter = 1;

      for (const floor of floors) {
        for (const zone of zones) {
          for (let i = 1; i <= 5; i++) {
            const slotType = types[i % 3];
            const hasEVCharging = slotType === 'premium' || i % 3 === 0;
            const isCovered = floor === 1; // First floor is covered

            // Randomly mark some as occupied or reserved (20% chance)
            const statusRand = Math.random();
            let status = 'available';
            if (statusRand > 0.95) status = 'occupied';
            else if (statusRand > 0.85) status = 'reserved';

            slots.push({
              id: `mock-slot-${lotId}-f${floor}-${zone}${i}`,
              lotId,
              slotNumber: `${zone}${floor}${i}`,
              type: slotType,
              status,
              hasEVCharging,
              isCovered,
              floor,
              zone,
            });

            slotCounter++;
          }
        }
      }

      this.runtimeSlots.set(lotId, slots);
    }

    // Seed one active booking to show in the Dashboard
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - 1); // Started 1hr ago
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 2); // Ends in 2hrs

    this.runtimeBookings.push({
      id: 'mock-booking-active',
      userId: 'mock-user-customer',
      slotId: 'mock-slot-mock-uuid-1-1', // Slot A1 in Lulu Mall
      startTime,
      endTime,
      amount: 120.0,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      slot: {
        id: 'mock-slot-mock-uuid-1-1',
        name: 'A1',
        lot: {
          id: 'mock-uuid-1',
          name: 'Lulu Mall Smart Lot',
          location: 'Edappally, Kochi, Kerala 682024',
          pricing: 40.0,
        },
      },
    });

    this.runtimeSessions.push({
      id: 'mock-session-active',
      bookingId: 'mock-booking-active',
      userId: 'mock-user-customer',
      vehicleId: 'mock-vehicle-1',
      entryTime: startTime,
      exitTime: null,
      status: 'ACTIVE',
      createdAt: new Date(),
    });

    // Seed some completed bookings for history
    const pastStart1 = new Date();
    pastStart1.setDate(pastStart1.getDate() - 2);
    pastStart1.setHours(10, 0, 0);
    const pastEnd1 = new Date();
    pastEnd1.setDate(pastEnd1.getDate() - 2);
    pastEnd1.setHours(12, 0, 0);

    this.runtimeBookings.push({
      id: 'mock-booking-past-1',
      userId: 'mock-user-customer',
      slotId: 'mock-slot-mock-uuid-4-2', // MG Road slot B1
      startTime: pastStart1,
      endTime: pastEnd1,
      amount: 90.0,
      status: 'COMPLETED',
      createdAt: pastStart1,
      updatedAt: pastEnd1,
      slot: {
        id: 'mock-slot-mock-uuid-4-2',
        name: 'B1',
        lot: {
          id: 'mock-uuid-4',
          name: 'MG Road Secure Parking',
          location: 'MG Road, Kochi, Kerala 682016',
          pricing: 45.0,
        },
      },
    });
  }

  async getSlots(lotId: string) {
    if (this.isDbAvailable) {
      try {
        const slots = await this.prisma.parkingSlot.findMany({
          where: { lotId },
          include: {
            bookings: { where: { status: { in: ['PENDING', 'ACTIVE'] } } },
          },
        });

        // Map them dynamically to flag current occupancy
        return slots.map((slot) => {
          const isBookedNow = slot.bookings.some((b) => {
            const now = new Date();
            return b.startTime <= now && b.endTime >= now;
          });
          return {
            id: slot.id,
            lotId: slot.lotId,
            name: slot.name,
            status:
              slot.status === 'MAINTENANCE'
                ? 'MAINTENANCE'
                : isBookedNow
                  ? 'BOOKED'
                  : 'AVAILABLE',
          };
        });
      } catch (err: any) {
        this.logger.error(
          `Failed to fetch slots from DB: ${err.message}. Falling back.`,
        );
      }
    }

    const slots = this.runtimeSlots.get(lotId) || [];
    // Dynamically flag booked slots based on active runtime bookings
    return slots.map((slot) => {
      const isBookedNow = this.runtimeBookings.some(
        (b) =>
          b.slotId === slot.id &&
          (b.status === 'PENDING' || b.status === 'ACTIVE') &&
          b.startTime <= new Date() &&
          b.endTime >= new Date(),
      );
      return {
        ...slot,
        status:
          slot.status === 'MAINTENANCE'
            ? 'MAINTENANCE'
            : isBookedNow
              ? 'BOOKED'
              : 'AVAILABLE',
      };
    });
  }

  async getBookingHistory(userId: string) {
    if (this.isDbAvailable) {
      try {
        return await this.prisma.booking.findMany({
          where: { userId },
          include: {
            slot: {
              include: {
                lot: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      } catch (err: any) {
        this.logger.error(
          `Failed to fetch bookings from DB: ${err.message}. Falling back.`,
        );
      }
    }
    return this.runtimeBookings
      .filter((b) => b.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBookingDetails(id: string) {
    if (this.isDbAvailable) {
      try {
        const booking = await this.prisma.booking.findUnique({
          where: { id },
          include: {
            slot: {
              include: {
                lot: true,
              },
            },
            payments: true,
            sessions: true,
          },
        });
        if (booking) return booking;
      } catch {}
    }
    return this.runtimeBookings.find((b) => b.id === id);
  }

  async createBooking(userId: string, data: any) {
    const { slotId, startTimeStr, endTimeStr, amount } = data;
    if (!slotId || !startTimeStr || !endTimeStr || !amount) {
      throw new BadRequestException(
        'slotId, startTime, endTime, and amount are required',
      );
    }

    const startTime = new Date(startTimeStr);
    const endTime = new Date(endTimeStr);

    if (startTime >= endTime) {
      throw new BadRequestException('Start time must be before end time');
    }

    if (this.isDbAvailable) {
      try {
        // Double check slot occupancy for date range
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
          data: {
            userId,
            slotId,
            startTime,
            endTime,
            amount,
            status: 'PENDING',
          },
          include: {
            slot: {
              include: {
                lot: true,
              },
            },
          },
        });

        // Trigger welcome notifications
        await this.prisma.notification
          .create({
            data: {
              userId,
              type: 'CONFIRMATION',
              message: `Booking confirmed at ${booking.slot.lot.name}. Slot: ${booking.slot.name}.`,
            },
          })
          .catch(() => {});

        return booking;
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        this.logger.error(
          `Failed to create booking in DB: ${err.message}. Falling back.`,
        );
      }
    }

    // In-memory creation
    // Find slot details
    let foundSlot: any = null;
    let foundLot: any = null;

    // Search through in-memory map
    for (const [lotId, slots] of this.runtimeSlots.entries()) {
      const slot = slots.find((s) => s.id === slotId || s.id === data.slotId);
      if (slot) {
        foundSlot = slot;
        // Mock matching lot lookup
        foundLot = {
          id: lotId,
          name:
            lotId === 'mock-uuid-1'
              ? 'Lulu Mall Smart Lot'
              : 'Secure Car Parking',
          location: 'Kochi, India',
          pricing: 50.0,
        };
        break;
      }
    }

    if (!foundSlot) {
      foundSlot = { id: slotId, name: 'Custom' };
      foundLot = {
        id: 'custom-lot',
        name: 'SmartPark Lot',
        location: 'Kochi, Kerala',
        pricing: 40,
      };
    }

    const bookingId = `mock-booking-${Date.now()}`;
    const newBooking = {
      id: bookingId,
      userId,
      slotId,
      startTime,
      endTime,
      amount,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      slot: {
        id: foundSlot.id,
        name: foundSlot.name,
        lot: foundLot,
      },
    };

    this.runtimeBookings.push(newBooking);
    return newBooking;
  }

  async cancelBooking(userId: string, id: string) {
    if (this.isDbAvailable) {
      try {
        const booking = await this.prisma.booking.findFirst({
          where: { id, userId },
        });

        if (!booking) {
          throw new NotFoundException('Booking not found');
        }

        if (booking.status === 'ACTIVE' || booking.status === 'COMPLETED') {
          throw new BadRequestException(
            'Cannot cancel an active or completed booking',
          );
        }

        const updated = await this.prisma.booking.update({
          where: { id },
          data: { status: 'CANCELLED' },
        });

        // Trigger notification
        await this.prisma.notification
          .create({
            data: {
              userId,
              type: 'CANCEL',
              message: `Booking ID ${id.substring(0, 8)} has been cancelled successfully.`,
            },
          })
          .catch(() => {});

        return updated;
      } catch (err: any) {
        if (
          err instanceof BadRequestException ||
          err instanceof NotFoundException
        )
          throw err;
        this.logger.error(
          `Failed to cancel booking in DB: ${err.message}. Falling back.`,
        );
      }
    }

    const booking = this.runtimeBookings.find(
      (b) => b.id === id && b.userId === userId,
    );
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status === 'ACTIVE' || booking.status === 'COMPLETED') {
      throw new BadRequestException(
        'Cannot cancel an active or completed booking',
      );
    }

    booking.status = 'CANCELLED';
    return booking;
  }

  async simulateScan(body: { bookingId: string; action: 'ENTRY' | 'EXIT' }) {
    const { bookingId, action } = body;
    if (!bookingId || !action) {
      throw new BadRequestException('bookingId and action are required');
    }

    if (this.isDbAvailable) {
      try {
        const booking = await this.prisma.booking.findUnique({
          where: { id: bookingId },
          include: { slot: { include: { lot: true } } },
        });

        if (!booking) {
          throw new NotFoundException('Booking reservation not found');
        }

        if (action === 'ENTRY') {
          if (booking.status !== 'PENDING') {
            throw new BadRequestException(
              `Cannot check in: Booking status is ${booking.status}`,
            );
          }

          // Update booking status
          await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'ACTIVE' },
          });

          // Create active session
          await this.prisma.parkingSession.create({
            data: {
              bookingId,
              userId: booking.userId,
              entryTime: new Date(),
              status: 'ACTIVE',
            },
          });

          // Record simulated gate activity without requiring a linked vehicle record.
          await this.prisma.auditLog
            .create({
              data: {
                userId: booking.userId,
                action: 'GATE_ENTRY',
                details: `Gate entry scanned for booking ${bookingId} at ${booking.slot.lot.name}, slot ${booking.slot.name}.`,
              },
            })
            .catch(() => {});

          // Send Alert Notification
          await this.prisma.notification
            .create({
              data: {
                userId: booking.userId,
                type: 'GATE_ENTRY',
                message: `Check-in successful! Park your vehicle at slot ${booking.slot.name} inside ${booking.slot.lot.name}.`,
              },
            })
            .catch(() => {});

          return {
            success: true,
            status: 'ACTIVE',
            message: 'Gate opened. Entry recorded.',
          };
        } else {
          // EXIT
          if (booking.status !== 'ACTIVE') {
            throw new BadRequestException(
              `Cannot check out: Booking status is ${booking.status}`,
            );
          }

          // Update booking status
          await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'COMPLETED' },
          });

          // Close active session
          const session = await this.prisma.parkingSession.findFirst({
            where: { bookingId, status: 'ACTIVE' },
          });

          if (session) {
            await this.prisma.parkingSession.update({
              where: { id: session.id },
              data: {
                exitTime: new Date(),
                status: 'COMPLETED',
              },
            });
          }

          // Record simulated gate activity without requiring a linked vehicle record.
          await this.prisma.auditLog
            .create({
              data: {
                userId: booking.userId,
                action: 'GATE_EXIT',
                details: `Gate exit scanned for booking ${bookingId} at ${booking.slot.lot.name}, slot ${booking.slot.name}.`,
              },
            })
            .catch(() => {});

          // Send Exit Alert
          await this.prisma.notification
            .create({
              data: {
                userId: booking.userId,
                type: 'GATE_EXIT',
                message: `Check-out successful! Thank you for parking with us at ${booking.slot.lot.name}.`,
              },
            })
            .catch(() => {});

          return {
            success: true,
            status: 'COMPLETED',
            message: 'Gate opened. Exit recorded.',
          };
        }
      } catch (err: any) {
        if (
          err instanceof BadRequestException ||
          err instanceof NotFoundException
        )
          throw err;
        this.logger.error(
          `Failed to scan in DB: ${err.message}. Falling back.`,
        );
      }
    }

    // In-memory simulation logic
    const booking = this.runtimeBookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new NotFoundException('Booking reservation not found');
    }

    if (action === 'ENTRY') {
      if (booking.status !== 'PENDING') {
        throw new BadRequestException(
          `Cannot check in: Booking status is ${booking.status}`,
        );
      }

      booking.status = 'ACTIVE';

      this.runtimeSessions.push({
        id: `session-${Date.now()}`,
        bookingId,
        userId: booking.userId,
        entryTime: new Date(),
        exitTime: null,
        status: 'ACTIVE',
      });

      this.runtimeEntryLogs.push({
        id: `log-${Date.now()}`,
        cameraIds: 'GATE-CAM-IN-01',
        action: 'ENTRY',
        timestamp: new Date(),
      });

      return {
        success: true,
        status: 'ACTIVE',
        message: 'Gate opened. Entry recorded (In-Memory).',
      };
    } else {
      // EXIT
      if (booking.status !== 'ACTIVE') {
        throw new BadRequestException(
          `Cannot check out: Booking status is ${booking.status}`,
        );
      }

      booking.status = 'COMPLETED';

      const session = this.runtimeSessions.find(
        (s) => s.bookingId === bookingId && s.status === 'ACTIVE',
      );
      if (session) {
        session.status = 'COMPLETED';
        session.exitTime = new Date();
      }

      this.runtimeEntryLogs.push({
        id: `log-${Date.now()}`,
        cameraIds: 'GATE-CAM-OUT-01',
        action: 'EXIT',
        timestamp: new Date(),
      });

      return {
        success: true,
        status: 'COMPLETED',
        message: 'Gate opened. Exit recorded (In-Memory).',
      };
    }
  }
}
