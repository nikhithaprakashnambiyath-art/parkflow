import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class VehicleService {
  private readonly logger = new Logger(VehicleService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getVehicles(userId: string) {
    return this.prisma.vehicle.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addVehicle(userId: string, data: { plateNumber: string; type: string }) {
    const { plateNumber, type } = data;

    if (!plateNumber || !type) {
      throw new BadRequestException('Plate number and vehicle type are required');
    }

    const cleanedPlate = plateNumber.toUpperCase().trim();

    const existing = await this.prisma.vehicle.findUnique({
      where: { plateNumber: cleanedPlate },
    });
    if (existing) {
      throw new BadRequestException(
        `Vehicle with plate ${cleanedPlate} already registered`,
      );
    }

    const vehicle = await this.prisma.vehicle.create({
      data: { userId, plateNumber: cleanedPlate, type },
    });

    this.logger.log(`Vehicle added: ${cleanedPlate} for user ${userId}`);
    return vehicle;
  }

  async removeVehicle(userId: string, id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: { id, userId },
    });

    if (!vehicle) {
      throw new BadRequestException(
        'Vehicle not found or does not belong to you',
      );
    }

    await this.prisma.vehicle.delete({ where: { id } });
    this.logger.log(`Vehicle ${id} removed for user ${userId}`);
    return { success: true };
  }
}
