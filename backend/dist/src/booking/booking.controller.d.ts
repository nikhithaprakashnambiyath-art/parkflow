import { BookingService } from './booking.service';
export declare class BookingController {
    private readonly bookingService;
    constructor(bookingService: BookingService);
    getSlots(lotId: string): Promise<any[]>;
    getBookingHistory(req: any): Promise<any[]>;
    getBookingDetails(id: string): Promise<any>;
    createBooking(req: any, body: any): Promise<{
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
    cancelBooking(req: any, id: string): Promise<any>;
    simulateScan(body: {
        bookingId: string;
        action: 'ENTRY' | 'EXIT';
    }): Promise<{
        success: boolean;
        status: string;
        message: string;
    }>;
}
