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
var ParkingService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParkingService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ParkingService = ParkingService_1 = class ParkingService {
    prisma;
    logger = new common_1.Logger(ParkingService_1.name);
    isDbAvailable = true;
    mockParkingLots = [
        {
            name: 'Kozhikode Beach Parking',
            location: 'Beach Road, Kozhikode, Kerala 673032',
            coordinates: JSON.stringify({ lat: 11.2588, lng: 75.7804 }),
            pricing: 40.0,
            availability: 120,
            totalSlots: 120,
            rating: 4.5,
            image: 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?q=80&w=600&auto=format&fit=crop',
            hasEVCharging: false,
            isCovered: false,
            hasSecurity: true,
            isAccessible: true,
        },
        {
            name: 'Lulu Mall Parking',
            location: 'Kochi, Kerala',
            coordinates: JSON.stringify({ lat: 10.027, lng: 76.3089 }),
            pricing: 50.0,
            availability: 40,
            totalSlots: 120,
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?q=80&w=600&auto=format&fit=crop',
            hasEVCharging: true,
            isCovered: true,
            hasSecurity: true,
            isAccessible: true,
        },
        {
            name: 'Thampanoor Parking Hub',
            location: 'Thampanoor, Thiruvananthapuram, Kerala 695001',
            coordinates: JSON.stringify({ lat: 8.4875, lng: 76.9525 }),
            pricing: 50.0,
            availability: 180,
            totalSlots: 180,
            rating: 4.6,
            image: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?q=80&w=600&auto=format&fit=crop',
            hasEVCharging: true,
            isCovered: true,
            hasSecurity: true,
            isAccessible: true,
        },
        {
            name: 'Thrissur Round Parking',
            location: 'Swaraj Round, Thrissur, Kerala 680001',
            coordinates: JSON.stringify({ lat: 10.5276, lng: 76.2144 }),
            pricing: 30.0,
            availability: 90,
            totalSlots: 90,
            rating: 4.3,
            image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=600&auto=format&fit=crop',
            hasEVCharging: false,
            isCovered: true,
            hasSecurity: true,
            isAccessible: false,
        },
        {
            name: 'HiLite Mall Parking',
            location: 'Calicut, Kerala',
            coordinates: JSON.stringify({ lat: 11.248, lng: 75.833 }),
            pricing: 40.0,
            availability: 20,
            totalSlots: 80,
            rating: 4.5,
            image: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?q=80&w=600&auto=format&fit=crop',
            hasEVCharging: false,
            isCovered: true,
            hasSecurity: true,
            isAccessible: true,
        },
    ];
    runtimeParkingLots = [];
    constructor(prisma) {
        this.prisma = prisma;
        this.runtimeParkingLots = this.mockParkingLots.map(({ totalSlots, ...lot }, index) => ({
            id: `mock-uuid-${index + 1}`,
            ...lot,
        }));
    }
    async onModuleInit() {
        try {
            this.logger.log('Verifying database availability...');
            const count = await this.prisma.parkingLot.count();
            this.logger.log(`Prisma DB is available. Found ${count} parking lots.`);
            await this.ensureDefaultParkingLots();
        }
        catch (error) {
            this.logger.warn(`Database connection failed: ${error.message}. Switching to resilient local mock data mode.`);
            this.isDbAvailable = false;
        }
    }
    getSlotName(index) {
        const row = String.fromCharCode(65 + Math.floor((index - 1) / 10));
        const number = ((index - 1) % 10) + 1;
        return `${row}${number}`;
    }
    async ensureSlotsForLot(lotId, totalSlots, availableSlots) {
        const existingSlots = await this.prisma.parkingSlot.findMany({
            where: { lotId },
            orderBy: { createdAt: 'asc' },
            select: { id: true },
        });
        for (let index = existingSlots.length + 1; index <= totalSlots; index++) {
            await this.prisma.parkingSlot.create({
                data: {
                    lotId,
                    name: this.getSlotName(index),
                    status: index <= availableSlots ? 'AVAILABLE' : 'BOOKED',
                },
            });
        }
    }
    async ensureDefaultParkingLots() {
        for (const lot of this.mockParkingLots) {
            const { totalSlots, ...lotData } = lot;
            const existingLot = await this.prisma.parkingLot.findFirst({
                where: {
                    name: lot.name,
                    location: lot.location,
                },
            });
            const savedLot = existingLot
                ? await this.prisma.parkingLot.update({
                    where: { id: existingLot.id },
                    data: lotData,
                })
                : await this.prisma.parkingLot.create({
                    data: lotData,
                });
            await this.ensureSlotsForLot(savedLot.id, totalSlots, lot.availability);
        }
        this.logger.log('Default parking lots are available.');
    }
    getHaversineDistance(coords1, coords2) {
        const R = 6371.0;
        const dLat = ((coords2.lat - coords1.lat) * Math.PI) / 180;
        const dLon = ((coords2.lng - coords1.lng) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((coords1.lat * Math.PI) / 180) *
                Math.cos((coords2.lat * Math.PI) / 180) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    parseCoordinates(coordsStr) {
        try {
            return JSON.parse(coordsStr);
        }
        catch {
            return { lat: 11.2588, lng: 75.7804 };
        }
    }
    async search(filters) {
        let lots = [];
        if (this.isDbAvailable) {
            try {
                const dbLots = await this.prisma.parkingLot.findMany({
                    include: {
                        slots: true,
                    },
                });
                lots = dbLots.map((lot) => ({
                    id: lot.id,
                    name: lot.name,
                    location: lot.location,
                    coordinates: lot.coordinates,
                    pricing: lot.pricing,
                    availability: lot.availability,
                    rating: lot.rating,
                    image: lot.image,
                    hasEVCharging: lot.hasEVCharging,
                    isCovered: lot.isCovered,
                    hasSecurity: lot.hasSecurity,
                    isAccessible: lot.isAccessible,
                }));
            }
            catch (error) {
                this.logger.error(`Failed to fetch from DB: ${error.message}. Falling back to in-memory.`);
                lots = [...this.runtimeParkingLots];
            }
        }
        else {
            lots = [...this.runtimeParkingLots];
        }
        if (filters.query) {
            const q = filters.query.toLowerCase();
            lots = lots.filter((lot) => lot.name.toLowerCase().includes(q) ||
                lot.location.toLowerCase().includes(q));
        }
        if (filters.price !== undefined) {
            const maxPrice = filters.price;
            lots = lots.filter((lot) => lot.pricing <= maxPrice);
        }
        if (filters.availability !== undefined) {
            const minAvail = filters.availability;
            lots = lots.filter((lot) => lot.availability >= minAvail);
        }
        if (filters.evCharging) {
            lots = lots.filter((lot) => lot.hasEVCharging);
        }
        if (filters.covered) {
            lots = lots.filter((lot) => lot.isCovered);
        }
        if (filters.security) {
            lots = lots.filter((lot) => lot.hasSecurity);
        }
        if (filters.accessibility) {
            lots = lots.filter((lot) => lot.isAccessible);
        }
        if (filters.lat !== undefined && filters.lng !== undefined) {
            const userCoords = { lat: filters.lat, lng: filters.lng };
            lots = lots
                .map((lot) => {
                const lotCoords = this.parseCoordinates(lot.coordinates);
                const distance = this.getHaversineDistance(userCoords, lotCoords);
                return { ...lot, distance };
            })
                .filter((lot) => {
                const maxRadius = filters.radius || 10;
                return lot.distance <= maxRadius;
            });
            lots.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        }
        else {
            const kochiCenter = { lat: 11.2588, lng: 75.7804 };
            lots = lots.map((lot) => {
                const lotCoords = this.parseCoordinates(lot.coordinates);
                const distance = this.getHaversineDistance(kochiCenter, lotCoords);
                return { ...lot, distance };
            });
            lots.sort((a, b) => b.rating - a.rating);
        }
        return lots;
    }
    async findOne(id) {
        if (this.isDbAvailable) {
            try {
                const lot = await this.prisma.parkingLot.findUnique({
                    where: { id },
                });
                if (lot)
                    return lot;
            }
            catch {
            }
        }
        const runtimeLot = this.runtimeParkingLots.find((l) => l.id === id);
        return runtimeLot || null;
    }
    async findNearby(lat, lng, radius = 5) {
        return this.search({ lat, lng, radius });
    }
};
exports.ParkingService = ParkingService;
exports.ParkingService = ParkingService = ParkingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ParkingService);
//# sourceMappingURL=parking.service.js.map