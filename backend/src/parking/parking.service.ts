import { Injectable, Logger } from '@nestjs/common';
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

interface SeedParkingLot extends Omit<ParkingLotResponse, 'id'> {
  totalSlots: number;
}

@Injectable()
export class ParkingService {
  private readonly logger = new Logger(ParkingService.name);

  private readonly defaultLots: SeedParkingLot[] = [
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
      location: 'Edappally, Kochi, Kerala 682024',
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
      location: 'Calicut, Kerala 673014',
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

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    try {
      const count = await this.prisma.parkingLot.count();
      this.logger.log(`Database has ${count} parking lots.`);
      if (count === 0) {
        await this.seedDefaultLots();
      }
    } catch (error: any) {
      this.logger.error(`Failed to seed parking lots: ${error.message}`);
    }
  }

  private getSlotName(index: number): string {
    const row = String.fromCharCode(65 + Math.floor((index - 1) / 10));
    const number = ((index - 1) % 10) + 1;
    return `${row}${number}`;
  }

  private async seedDefaultLots() {
    for (const lot of this.defaultLots) {
      const { totalSlots, ...lotData } = lot;
      const saved = await this.prisma.parkingLot.create({ data: lotData });

      for (let i = 1; i <= totalSlots; i++) {
        await this.prisma.parkingSlot.create({
          data: {
            lotId: saved.id,
            name: this.getSlotName(i),
            status: i <= lot.availability ? 'AVAILABLE' : 'BOOKED',
          },
        });
      }
      this.logger.log(`Seeded lot: ${saved.name} (${totalSlots} slots)`);
    }
  }

  private getHaversineDistance(c1: Coordinates, c2: Coordinates): number {
    const R = 6371.0;
    const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
    const dLon = ((c2.lng - c1.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((c1.lat * Math.PI) / 180) *
        Math.cos((c2.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  private parseCoordinates(str: string): Coordinates {
    try {
      return JSON.parse(str) as Coordinates;
    } catch {
      return { lat: 11.2588, lng: 75.7804 };
    }
  }

  async search(filters: {
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
  }): Promise<ParkingLotResponse[]> {
    const dbLots = await this.prisma.parkingLot.findMany();
    let lots: ParkingLotResponse[] = dbLots.map((lot) => ({
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

    if (filters.query) {
      const q = filters.query.toLowerCase();
      lots = lots.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q),
      );
    }
    if (filters.price !== undefined) {
      lots = lots.filter((l) => l.pricing <= filters.price!);
    }
    if (filters.availability !== undefined) {
      lots = lots.filter((l) => l.availability >= filters.availability!);
    }
    if (filters.evCharging) lots = lots.filter((l) => l.hasEVCharging);
    if (filters.covered) lots = lots.filter((l) => l.isCovered);
    if (filters.security) lots = lots.filter((l) => l.hasSecurity);
    if (filters.accessibility) lots = lots.filter((l) => l.isAccessible);

    const center: Coordinates =
      filters.lat !== undefined && filters.lng !== undefined
        ? { lat: filters.lat, lng: filters.lng }
        : { lat: 11.2588, lng: 75.7804 };

    lots = lots.map((l) => ({
      ...l,
      distance: this.getHaversineDistance(center, this.parseCoordinates(l.coordinates)),
    }));

    if (filters.lat !== undefined && filters.lng !== undefined) {
      const maxRadius = filters.radius ?? 10;
      lots = lots.filter((l) => (l.distance ?? 0) <= maxRadius);
      lots.sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));
    } else {
      lots.sort((a, b) => b.rating - a.rating);
    }

    return lots;
  }

  async findOne(id: string): Promise<ParkingLotResponse | null> {
    const lot = await this.prisma.parkingLot.findUnique({ where: { id } });
    if (!lot) return null;
    return {
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
    };
  }

  async findNearby(lat: number, lng: number, radius = 5): Promise<ParkingLotResponse[]> {
    return this.search({ lat, lng, radius });
  }
}
