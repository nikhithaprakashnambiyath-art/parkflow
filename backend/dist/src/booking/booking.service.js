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
var BookingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let BookingService = BookingService_1 = class BookingService {
    prisma;
    logger = new common_1.Logger(BookingService_1.name);
    isDbAvailable = true;
    runtimeBookings = [];
    runtimeSessions = [];
    runtimeEntryLogs = [];
    runtimeSlots = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            await this.prisma.booking.count();
            this.logger.log('Prisma DB connection is active for Bookings.');
        }
        catch (error) {
            this.logger.warn(`Prisma DB connection failed for Bookings: ${error.message}. Using in-memory fallback.`);
            this.isDbAvailable = false;
            this.seedRuntimeData();
        }
    }
    seedRuntimeData() {
        for (let index = 1; index <= 20; index++) {
            const lotId = `mock-uuid-${index}`;
            const slots = [];
            const floors = [0, 1];
            const zones = ['A', 'B', 'C', 'D'];
            const types = ['compact', 'standard', 'premium'];
            let slotCounter = 1;
            for (const floor of floors) {
                for (const zone of zones) {
                    for (let i = 1; i <= 5; i++) {
                        const slotType = types[i % 3];
                        const hasEVCharging = slotType === 'premium' || i % 3 === 0;
                        const isCovered = floor === 1;
                        const statusRand = Math.random();
                        let status = 'available';
                        if (statusRand > 0.95)
                            status = 'occupied';
                        else if (statusRand > 0.85)
                            status = 'reserved';
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
        const startTime = new Date();
        startTime.setHours(startTime.getHours() - 1);
        const endTime = new Date();
        endTime.setHours(endTime.getHours() + 2);
        this.runtimeBookings.push({
            id: 'mock-booking-active',
            userId: 'mock-user-customer',
            slotId: 'mock-slot-mock-uuid-1-1',
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
        const pastStart1 = new Date();
        pastStart1.setDate(pastStart1.getDate() - 2);
        pastStart1.setHours(10, 0, 0);
        const pastEnd1 = new Date();
        pastEnd1.setDate(pastEnd1.getDate() - 2);
        pastEnd1.setHours(12, 0, 0);
        this.runtimeBookings.push({
            id: 'mock-booking-past-1',
            userId: 'mock-user-customer',
            slotId: 'mock-slot-mock-uuid-4-2',
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
    async getSlots(lotId) {
        if (this.isDbAvailable) {
            try {
                const slots = await this.prisma.parkingSlot.findMany({
                    where: { lotId },
                    include: {
                        bookings: { where: { status: { in: ['PENDING', 'ACTIVE'] } } },
                    },
                });
                return slots.map((slot) => {
                    const isBookedNow = slot.bookings.some((b) => {
                        const now = new Date();
                        return b.startTime <= now && b.endTime >= now;
                    });
                    return {
                        id: slot.id,
                        lotId: slot.lotId,
                        name: slot.name,
                        status: slot.status === 'MAINTENANCE'
                            ? 'MAINTENANCE'
                            : isBookedNow
                                ? 'BOOKED'
                                : 'AVAILABLE',
                    };
                });
            }
            catch (err) {
                this.logger.error(`Failed to fetch slots from DB: ${err.message}. Falling back.`);
            }
        }
        const slots = this.runtimeSlots.get(lotId) || [];
        return slots.map((slot) => {
            const isBookedNow = this.runtimeBookings.some((b) => b.slotId === slot.id &&
                (b.status === 'PENDING' || b.status === 'ACTIVE') &&
                b.startTime <= new Date() &&
                b.endTime >= new Date());
            return {
                ...slot,
                status: slot.status === 'MAINTENANCE'
                    ? 'MAINTENANCE'
                    : isBookedNow
                        ? 'BOOKED'
                        : 'AVAILABLE',
            };
        });
    }
    async getBookingHistory(userId) {
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
            }
            catch (err) {
                this.logger.error(`Failed to fetch bookings from DB: ${err.message}. Falling back.`);
            }
        }
        return this.runtimeBookings
            .filter((b) => b.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async getBookingDetails(id) {
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
                if (booking)
                    return booking;
            }
            catch { }
        }
        return this.runtimeBookings.find((b) => b.id === id);
    }
    async createBooking(userId, data) {
        const { slotId, startTimeStr, endTimeStr, amount } = data;
        if (!slotId || !startTimeStr || !endTimeStr || !amount) {
            throw new common_1.BadRequestException('slotId, startTime, endTime, and amount are required');
        }
        const startTime = new Date(startTimeStr);
        const endTime = new Date(endTimeStr);
        if (startTime >= endTime) {
            throw new common_1.BadRequestException('Start time must be before end time');
        }
        if (this.isDbAvailable) {
            try {
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
                    throw new common_1.BadRequestException('This slot is already booked for the selected time window.');
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
                await this.prisma.notification
                    .create({
                    data: {
                        userId,
                        type: 'CONFIRMATION',
                        message: `Booking confirmed at ${booking.slot.lot.name}. Slot: ${booking.slot.name}.`,
                    },
                })
                    .catch(() => { });
                return booking;
            }
            catch (err) {
                if (err instanceof common_1.BadRequestException)
                    throw err;
                this.logger.error(`Failed to create booking in DB: ${err.message}. Falling back.`);
            }
        }
        let foundSlot = null;
        let foundLot = null;
        for (const [lotId, slots] of this.runtimeSlots.entries()) {
            const slot = slots.find((s) => s.id === slotId || s.id === data.slotId);
            if (slot) {
                foundSlot = slot;
                foundLot = {
                    id: lotId,
                    name: lotId === 'mock-uuid-1'
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
    async cancelBooking(userId, id) {
        if (this.isDbAvailable) {
            try {
                const booking = await this.prisma.booking.findFirst({
                    where: { id, userId },
                });
                if (!booking) {
                    throw new common_1.NotFoundException('Booking not found');
                }
                if (booking.status === 'ACTIVE' || booking.status === 'COMPLETED') {
                    throw new common_1.BadRequestException('Cannot cancel an active or completed booking');
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
                        message: `Booking ID ${id.substring(0, 8)} has been cancelled successfully.`,
                    },
                })
                    .catch(() => { });
                return updated;
            }
            catch (err) {
                if (err instanceof common_1.BadRequestException ||
                    err instanceof common_1.NotFoundException)
                    throw err;
                this.logger.error(`Failed to cancel booking in DB: ${err.message}. Falling back.`);
            }
        }
        const booking = this.runtimeBookings.find((b) => b.id === id && b.userId === userId);
        if (!booking) {
            throw new common_1.NotFoundException('Booking not found');
        }
        if (booking.status === 'ACTIVE' || booking.status === 'COMPLETED') {
            throw new common_1.BadRequestException('Cannot cancel an active or completed booking');
        }
        booking.status = 'CANCELLED';
        return booking;
    }
    async simulateScan(body) {
        const { bookingId, action } = body;
        if (!bookingId || !action) {
            throw new common_1.BadRequestException('bookingId and action are required');
        }
        if (this.isDbAvailable) {
            try {
                const booking = await this.prisma.booking.findUnique({
                    where: { id: bookingId },
                    include: { slot: { include: { lot: true } } },
                });
                if (!booking) {
                    throw new common_1.NotFoundException('Booking reservation not found');
                }
                if (action === 'ENTRY') {
                    if (booking.status !== 'PENDING') {
                        throw new common_1.BadRequestException(`Cannot check in: Booking status is ${booking.status}`);
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
                            details: `Gate entry scanned for booking ${bookingId} at ${booking.slot.lot.name}, slot ${booking.slot.name}.`,
                        },
                    })
                        .catch(() => { });
                    await this.prisma.notification
                        .create({
                        data: {
                            userId: booking.userId,
                            type: 'GATE_ENTRY',
                            message: `Check-in successful! Park your vehicle at slot ${booking.slot.name} inside ${booking.slot.lot.name}.`,
                        },
                    })
                        .catch(() => { });
                    return {
                        success: true,
                        status: 'ACTIVE',
                        message: 'Gate opened. Entry recorded.',
                    };
                }
                else {
                    if (booking.status !== 'ACTIVE') {
                        throw new common_1.BadRequestException(`Cannot check out: Booking status is ${booking.status}`);
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
                            data: {
                                exitTime: new Date(),
                                status: 'COMPLETED',
                            },
                        });
                    }
                    await this.prisma.auditLog
                        .create({
                        data: {
                            userId: booking.userId,
                            action: 'GATE_EXIT',
                            details: `Gate exit scanned for booking ${bookingId} at ${booking.slot.lot.name}, slot ${booking.slot.name}.`,
                        },
                    })
                        .catch(() => { });
                    await this.prisma.notification
                        .create({
                        data: {
                            userId: booking.userId,
                            type: 'GATE_EXIT',
                            message: `Check-out successful! Thank you for parking with us at ${booking.slot.lot.name}.`,
                        },
                    })
                        .catch(() => { });
                    return {
                        success: true,
                        status: 'COMPLETED',
                        message: 'Gate opened. Exit recorded.',
                    };
                }
            }
            catch (err) {
                if (err instanceof common_1.BadRequestException ||
                    err instanceof common_1.NotFoundException)
                    throw err;
                this.logger.error(`Failed to scan in DB: ${err.message}. Falling back.`);
            }
        }
        const booking = this.runtimeBookings.find((b) => b.id === bookingId);
        if (!booking) {
            throw new common_1.NotFoundException('Booking reservation not found');
        }
        if (action === 'ENTRY') {
            if (booking.status !== 'PENDING') {
                throw new common_1.BadRequestException(`Cannot check in: Booking status is ${booking.status}`);
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
        }
        else {
            if (booking.status !== 'ACTIVE') {
                throw new common_1.BadRequestException(`Cannot check out: Booking status is ${booking.status}`);
            }
            booking.status = 'COMPLETED';
            const session = this.runtimeSessions.find((s) => s.bookingId === bookingId && s.status === 'ACTIVE');
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
};
exports.BookingService = BookingService;
exports.BookingService = BookingService = BookingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BookingService);
//# sourceMappingURL=booking.service.js.map