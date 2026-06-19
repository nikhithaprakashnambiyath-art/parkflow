import { PaymentService } from './payment.service';
export declare class PaymentController {
    private readonly paymentService;
    constructor(paymentService: PaymentService);
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
