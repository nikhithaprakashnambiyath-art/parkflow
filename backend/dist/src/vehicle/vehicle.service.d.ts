import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export declare class VehicleService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private isDbAvailable;
    private runtimeVehicles;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    getVehicles(userId: string): Promise<any[]>;
    addVehicle(userId: string, data: any): Promise<{
        id: string;
        userId: string;
        plateNumber: any;
        type: any;
        createdAt: Date;
    }>;
    removeVehicle(userId: string, id: string): Promise<{
        success: boolean;
    }>;
}
