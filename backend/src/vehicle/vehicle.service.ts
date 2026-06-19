import { Injectable, OnModuleInit, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehicleService implements OnModuleInit {
  private readonly logger = new Logger(VehicleService.name);
  private isDbAvailable = true;

  // In-memory vehicle storage fallback
  private runtimeVehicles: any[] = [
    {
      id: 'mock-vehicle-1',
      userId: 'mock-user-customer',
      plateNumber: 'KA-01-MJ-9999',
      type: 'suv',
      createdAt: new Date(),
    },
    {
      id: 'mock-vehicle-2',
      userId: 'mock-user-customer',
      plateNumber: 'KL-07-CS-1234',
      type: 'compact',
      createdAt: new Date(),
    }
  ];

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      await this.prisma.vehicle.count();
      this.logger.log('Prisma DB connection is active for Vehicles.');
    } catch (error) {
      this.logger.warn(`Prisma DB connection failed for Vehicles: ${error.message}. Using in-memory fallback.`);
      this.isDbAvailable = false;
    }
  }

  async getVehicles(userId: string) {
    if (this.isDbAvailable) {
      try {
        return await this.prisma.vehicle.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
        });
      } catch (err: any) {
        this.logger.error(`Failed to fetch vehicles from DB: ${err.message}. Falling back.`);
      }
    }
    return this.runtimeVehicles.filter(v => v.userId === userId);
  }

  async addVehicle(userId: string, data: any) {
    const { plateNumber, type } = data;
    if (!plateNumber || !type) {
      throw new BadRequestException('Plate number and vehicle type are required');
    }

    const cleanedPlate = plateNumber.toUpperCase().trim();

    if (this.isDbAvailable) {
      try {
        const existing = await this.prisma.vehicle.findUnique({
          where: { plateNumber: cleanedPlate },
        });
        if (existing) {
          throw new BadRequestException(`Vehicle with plate ${cleanedPlate} already registered`);
        }

        return await this.prisma.vehicle.create({
          data: {
            userId,
            plateNumber: cleanedPlate,
            type,
          },
        });
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        this.logger.error(`Failed to add vehicle in DB: ${err.message}. Falling back.`);
      }
    }

    const existing = this.runtimeVehicles.find(v => v.plateNumber === cleanedPlate);
    if (existing) {
      throw new BadRequestException(`Vehicle with plate ${cleanedPlate} already registered`);
    }

    const newVehicle = {
      id: `mock-vehicle-${Date.now()}`,
      userId,
      plateNumber: cleanedPlate,
      type,
      createdAt: new Date(),
    };
    this.runtimeVehicles.push(newVehicle);
    return newVehicle;
  }

  async removeVehicle(userId: string, id: string) {
    if (this.isDbAvailable) {
      try {
        const vehicle = await this.prisma.vehicle.findFirst({
          where: { id, userId },
        });
        if (!vehicle) {
          throw new BadRequestException('Vehicle not found or does not belong to you');
        }

        await this.prisma.vehicle.delete({ where: { id } });
        return { success: true };
      } catch (err: any) {
        if (err instanceof BadRequestException) throw err;
        this.logger.error(`Failed to delete vehicle in DB: ${err.message}. Falling back.`);
      }
    }

    const index = this.runtimeVehicles.findIndex(v => v.id === id && v.userId === userId);
    if (index === -1) {
      throw new BadRequestException('Vehicle not found or does not belong to you');
    }

    this.runtimeVehicles.splice(index, 1);
    return { success: true };
  }
}
