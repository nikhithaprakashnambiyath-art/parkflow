import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboardMetrics(): Promise<{
        totalRevenue: number;
        totalBookings: number;
        activeBookings: number;
        totalLots: number;
        occupancyRate: number;
        recentActivity: {
            id: string;
            action: string;
            details: string;
        }[];
    }>;
    getRevenueReport(): Promise<{
        name: string;
        revenue: number;
    }[]>;
    createLocation(body: any): Promise<{
        id: string;
        name: any;
        location: any;
        coordinates: any;
        pricing: number;
        availability: number;
        rating: number;
        image: string;
        hasEVCharging: boolean;
        isCovered: boolean;
        hasSecurity: boolean;
        isAccessible: boolean;
    }>;
    createPricingRule(lotId: string, body: any): Promise<{
        id: string;
        lotId: string;
        multiplier: number;
        startTime: any;
        endTime: any;
        createdAt: Date;
    }>;
    getPricingRules(lotId: string): Promise<any[]>;
    getAllBookings(): Promise<({
        user: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            email: string;
            password: string;
            role: import("@prisma/client").$Enums.Role;
        };
        slot: {
            lot: {
                id: string;
                name: string;
                location: string;
                coordinates: string;
                pricing: number;
                availability: number;
                rating: number;
                image: string;
                hasEVCharging: boolean;
                isCovered: boolean;
                hasSecurity: boolean;
                isAccessible: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: string;
            name: string;
            lotId: string;
            status: import("@prisma/client").$Enums.SlotStatus;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        slotId: string;
        startTime: Date;
        endTime: Date;
        amount: number;
    })[]>;
    updateBookingStatus(id: string, status: string): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.BookingStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        slotId: string;
        startTime: Date;
        endTime: Date;
        amount: number;
    } | {
        id: string;
        status: string;
        message: string;
    }>;
    getAllUsers(): Promise<{
        id: string;
        name: string;
        email: string;
        role: string;
        createdAt: Date;
        _count: {
            bookings: number;
            vehicles: number;
        };
        totalSpent: number;
    }[]>;
    updateUserStatus(id: string, isSuspended: boolean): Promise<{
        id: string;
        isSuspended: boolean;
        message: string;
    }>;
}
