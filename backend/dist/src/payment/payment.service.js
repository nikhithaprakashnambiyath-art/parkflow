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
var PaymentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentService = PaymentService_1 = class PaymentService {
    prisma;
    logger = new common_1.Logger(PaymentService_1.name);
    isDbAvailable = true;
    runtimePayments = [];
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            await this.prisma.payment.count();
            this.logger.log('Prisma DB connection is active for Payments.');
        }
        catch (error) {
            this.logger.warn(`Prisma DB connection failed for Payments: ${error.message}. Using in-memory fallback.`);
            this.isDbAvailable = false;
        }
    }
    async createPayment(body) {
        const { bookingId, amount, transactionId, method, status } = body;
        if (!bookingId || !amount) {
            throw new common_1.BadRequestException('bookingId and amount are required');
        }
        const resolvedStatus = status || 'COMPLETED';
        if (this.isDbAvailable) {
            try {
                const payment = await this.prisma.payment.create({
                    data: {
                        bookingId,
                        stripeChargeId: transactionId || `mock-tx-${Date.now()}`,
                        amount,
                        status: resolvedStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING',
                    },
                });
                if (resolvedStatus === 'COMPLETED') {
                    await this.prisma.booking.update({
                        where: { id: bookingId },
                        data: { status: 'PENDING' },
                    });
                }
                return payment;
            }
            catch (err) {
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
};
exports.PaymentService = PaymentService;
exports.PaymentService = PaymentService = PaymentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentService);
//# sourceMappingURL=payment.service.js.map