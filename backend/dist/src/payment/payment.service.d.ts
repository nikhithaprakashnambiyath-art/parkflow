import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private isDbAvailable;
    private runtimePayments;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    createPayment(body: any): Promise<{
        id: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        bookingId: string;
        stripeChargeId: string | null;
    } | {
        id: string;
        bookingId: any;
        stripeChargeId: any;
        amount: any;
        status: any;
        method: any;
        createdAt: Date;
    }>;
}
