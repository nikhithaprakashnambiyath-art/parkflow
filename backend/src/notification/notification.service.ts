import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private isDbAvailable = true;

  // In-memory fallback notification store
  private runtimeNotifications: any[] = [
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
      createdAt: new Date(Date.now() - 3600000), // 1 hour ago
    }
  ];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.prisma.notification.count();
      this.logger.log('Prisma DB connection is active for Notifications.');
    } catch (error) {
      this.logger.warn(`Prisma DB connection failed for Notifications: ${error.message}. Using in-memory fallback.`);
      this.isDbAvailable = false;
    }
  }

  async getNotifications(userId: string) {
    if (this.isDbAvailable) {
      try {
        return await this.prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
      } catch (err: any) {
        this.logger.error(`Failed to fetch notifications: ${err.message}. Falling back.`);
      }
    }
    return this.runtimeNotifications
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markAsRead(userId: string, id: string) {
    if (this.isDbAvailable) {
      try {
        const notification = await this.prisma.notification.findFirst({
          where: { id, userId },
        });

        if (!notification) {
          throw new NotFoundException('Notification not found');
        }

        return await this.prisma.notification.update({
          where: { id },
          data: { readStatus: true },
        });
      } catch (err: any) {
        if (err instanceof NotFoundException) throw err;
        this.logger.error(`Failed to update notification: ${err.message}. Falling back.`);
      }
    }

    const item = this.runtimeNotifications.find(n => n.id === id && n.userId === userId);
    if (!item) {
      throw new NotFoundException('Notification not found');
    }

    item.readStatus = true;
    return item;
  }

  async createNotification(userId: string, type: string, message: string) {
    if (this.isDbAvailable) {
      try {
        return await this.prisma.notification.create({
          data: {
            userId,
            type,
            message,
          },
        });
      } catch (err: any) {
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
}
