import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class BookingService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private isDbAvailable;
    private runtimeBookings;
    private runtimeSessions;
    private runtimeEntryLogs;
    private runtimeSlots;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private seedRuntimeData;
    getSlots(lotId: string): Promise<any[]>;
    getBookingHistory(userId: string): Promise<any[]>;
    getBookingDetails(id: string): Promise<any>;
    createBooking(userId: string, data: any): Promise<{
        id: string;
        userId: string;
        slotId: any;
        startTime: Date;
        endTime: Date;
        amount: any;
        status: string;
        createdAt: Date;
        updatedAt: Date;
        slot: {
            id: any;
            name: any;
            lot: any;
        };
    }>;
    cancelBooking(userId: string, id: string): Promise<any>;
    simulateScan(body: {
        bookingId: string;
        action: 'ENTRY' | 'EXIT';
    }): Promise<{
        success: boolean;
        status: string;
        message: string;
    }>;
}
