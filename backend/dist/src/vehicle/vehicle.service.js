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
var VehicleService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VehicleService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let VehicleService = VehicleService_1 = class VehicleService {
    prisma;
    logger = new common_1.Logger(VehicleService_1.name);
    isDbAvailable = true;
    runtimeVehicles = [
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
    constructor(prisma) {
        this.prisma = prisma;
    }
    async onModuleInit() {
        try {
            await this.prisma.vehicle.count();
            this.logger.log('Prisma DB connection is active for Vehicles.');
        }
        catch (error) {
            this.logger.warn(`Prisma DB connection failed for Vehicles: ${error.message}. Using in-memory fallback.`);
            this.isDbAvailable = false;
        }
    }
    async getVehicles(userId) {
        if (this.isDbAvailable) {
            try {
                return await this.prisma.vehicle.findMany({
                    where: { userId },
                    orderBy: { createdAt: 'desc' },
                });
            }
            catch (err) {
                this.logger.error(`Failed to fetch vehicles from DB: ${err.message}. Falling back.`);
            }
        }
        return this.runtimeVehicles.filter(v => v.userId === userId);
    }
    async addVehicle(userId, data) {
        const { plateNumber, type } = data;
        if (!plateNumber || !type) {
            throw new common_1.BadRequestException('Plate number and vehicle type are required');
        }
        const cleanedPlate = plateNumber.toUpperCase().trim();
        if (this.isDbAvailable) {
            try {
                const existing = await this.prisma.vehicle.findUnique({
                    where: { plateNumber: cleanedPlate },
                });
                if (existing) {
                    throw new common_1.BadRequestException(`Vehicle with plate ${cleanedPlate} already registered`);
                }
                return await this.prisma.vehicle.create({
                    data: {
                        userId,
                        plateNumber: cleanedPlate,
                        type,
                    },
                });
            }
            catch (err) {
                if (err instanceof common_1.BadRequestException)
                    throw err;
                this.logger.error(`Failed to add vehicle in DB: ${err.message}. Falling back.`);
            }
        }
        const existing = this.runtimeVehicles.find(v => v.plateNumber === cleanedPlate);
        if (existing) {
            throw new common_1.BadRequestException(`Vehicle with plate ${cleanedPlate} already registered`);
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
    async removeVehicle(userId, id) {
        if (this.isDbAvailable) {
            try {
                const vehicle = await this.prisma.vehicle.findFirst({
                    where: { id, userId },
                });
                if (!vehicle) {
                    throw new common_1.BadRequestException('Vehicle not found or does not belong to you');
                }
                await this.prisma.vehicle.delete({ where: { id } });
                return { success: true };
            }
            catch (err) {
                if (err instanceof common_1.BadRequestException)
                    throw err;
                this.logger.error(`Failed to delete vehicle in DB: ${err.message}. Falling back.`);
            }
        }
        const index = this.runtimeVehicles.findIndex(v => v.id === id && v.userId === userId);
        if (index === -1) {
            throw new common_1.BadRequestException('Vehicle not found or does not belong to you');
        }
        this.runtimeVehicles.splice(index, 1);
        return { success: true };
    }
};
exports.VehicleService = VehicleService;
exports.VehicleService = VehicleService = VehicleService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], VehicleService);
//# sourceMappingURL=vehicle.service.js.map