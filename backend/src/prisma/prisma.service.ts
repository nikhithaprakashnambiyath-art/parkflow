import 'dotenv/config';
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super({
      accelerateUrl: process.env.DATABASE_URL,
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (error) {
      // Connect failure is caught so NestJS bootstrap continues to fallback mode
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch {}
  }
}
