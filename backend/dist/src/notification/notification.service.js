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
var NotificationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let NotificationService = NotificationService_1 = class NotificationService {
    prisma;
    logger = new common_1.Logger(NotificationService_1.name);
    isDbAvailable = true;
    runtimeNotifications = [
        {
            id: 'mock-notify-1',
            userId: 'mock-user-customer',
            type: 'WELCOME',
            message: 'Welcome to SmartPark, Alex! Your premium account is now active.',
            readStatus: false,
            createdAt: new Date(),
        },
        {
            id: 'mock-notify-2',
            userId: 'mock-user-customer',
            type: 'BOOKING_CONFIRMATION',
            message: 'Booking confirmed! Slot A1 at Lulu Mall Smart Lot is reserved for 2 hours.',
            readStatus: true,
            createdAt: new Date(Date.now() - 3600000),
        }
    ];
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            await this.prisma.notification.count();
            this.logger.log('Prisma DB connection is active for Notifications.');
        }
        catch (error) {
            this.logger.warn(`Prisma DB connection failed for Notifications: ${error.message}. Using in-memory fallback.`);
            this.isDbAvailable = false;
        }
    }
    async getNotifications(userId) {
        if (this.isDbAvailable) {
            try {
                return await this.prisma.notification.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                });
            }
            catch (err) {
                this.logger.error(`Failed to fetch notifications: ${err.message}. Falling back.`);
            }
        }
        return this.runtimeNotifications
            .filter(n => n.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async markAsRead(userId, id) {
        if (this.isDbAvailable) {
            try {
                const notification = await this.prisma.notification.findFirst({
                    where: { id, userId },
                });
                if (!notification) {
                    throw new common_1.NotFoundException('Notification not found');
                }
                return await this.prisma.notification.update({
                    where: { id },
                    data: { readStatus: true },
                });
            }
            catch (err) {
                if (err instanceof common_1.NotFoundException)
                    throw err;
                this.logger.error(`Failed to update notification: ${err.message}. Falling back.`);
            }
        }
        const item = this.runtimeNotifications.find(n => n.id === id && n.userId === userId);
        if (!item) {
            throw new common_1.NotFoundException('Notification not found');
        }
        item.readStatus = true;
        return item;
    }
    async createNotification(userId, type, message) {
        if (this.isDbAvailable) {
            try {
                return await this.prisma.notification.create({
                    data: {
                        userId,
                        type,
                        message,
                    },
                });
            }
            catch (err) {
                this.logger.error(`Failed to create notification in DB: ${err.message}`);
            }
        }
        const newNotify = {
            id: `mock-notify-${Date.now()}`,
            userId,
            type,
            message,
            readStatus: false,
            createdAt: new Date(),
        };
        this.runtimeNotifications.push(newNotify);
        return newNotify;
    }
};
exports.NotificationService = NotificationService;
exports.NotificationService = NotificationService = NotificationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], NotificationService);
//# sourceMappingURL=notification.service.js.map