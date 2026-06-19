import { OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
export interface Coordinates {
    lat: number;
    lng: number;
}
export interface ParkingLotResponse {
    id: string;
    name: string;
    location: string;
    coordinates: string;
    pricing: number;
    availability: number;
    rating: number;
    image: string;
    hasEVCharging: boolean;
    isCovered: boolean;
    hasSecurity: boolean;
    isAccessible: boolean;
    distance?: number;
}
export declare class ParkingService implements OnModuleInit {
    private readonly prisma;
    private readonly logger;
    private isDbAvailable;
    private readonly mockParkingLots;
    private runtimeParkingLots;
    constructor(prisma: PrismaService);
    onModuleInit(): Promise<void>;
    private getSlotName;
    private ensureSlotsForLot;
    private ensureDefaultParkingLots;
    private getHaversineDistance;
    private parseCoordinates;
    search(filters: {
        query?: string;
        lat?: number;
        lng?: number;
        radius?: number;
        price?: number;
        availability?: number;
        evCharging?: boolean;
        covered?: boolean;
        security?: boolean;
        accessibility?: boolean;
    }): Promise<ParkingLotResponse[]>;
    findOne(id: string): Promise<ParkingLotResponse | null>;
    findNearby(lat: number, lng: number, radius?: number): Promise<ParkingLotResponse[]>;
}
