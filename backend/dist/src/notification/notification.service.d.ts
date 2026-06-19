import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class NotificationService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private isDbAvailable;
    private runtimeNotifications;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    getNotifications(userId: string): Promise<any[]>;
    markAsRead(userId: string, id: string): Promise<any>;
    createNotification(userId: string, type: string, message: string): Promise<{
        id: string;
        createdAt: Date;
        type: string;
        message: string;
        readStatus: boolean;
        userId: string;
    }>;
}
