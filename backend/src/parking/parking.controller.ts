import { Controller, Get, Param, Query, NotFoundException } from '@nestjs/common';
import { ParkingService, ParkingLotResponse } from './parking.service';

@Controller('api/parking')
export class ParkingController {
  constructor(private readonly parkingService: ParkingService) {}

  @Get('search')
  async search(
    @Query('query') query?: string,
    @Query('lat') latStr?: string,
    @Query('lng') lngStr?: string,
    @Query('radius') radiusStr?: string,
    @Query('price') priceStr?: string,
    @Query('availability') availStr?: string,
    @Query('evCharging') evChargingStr?: string,
    @Query('covered') coveredStr?: string,
    @Query('security') securityStr?: string,
    @Query('accessibility') accessibilityStr?: string,
  ): Promise<ParkingLotResponse[]> {
    const lat = latStr ? parseFloat(latStr) : undefined;
    const lng = lngStr ? parseFloat(lngStr) : undefined;
    const radius = radiusStr ? parseFloat(radiusStr) : undefined;
    const price = priceStr ? parseFloat(priceStr) : undefined;
    const availability = availStr ? parseInt(availStr, 10) : undefined;
    
    const evCharging = evChargingStr === 'true';
    const covered = coveredStr === 'true';
    const security = securityStr === 'true';
    const accessibility = accessibilityStr === 'true';

    return this.parkingService.search({
      query,
      lat,
      lng,
      radius,
      price,
      availability,
      evCharging,
      covered,
      security,
      accessibility,
    });
  }

  @Get('nearby')
  async nearby(
    @Query('lat') latStr: string,
    @Query('lng') lngStr: string,
    @Query('radius') radiusStr?: string,
  ): Promise<ParkingLotResponse[]> {
    if (!latStr || !lngStr) {
      throw new NotFoundException('lat and lng query parameters are required for nearby search');
    }
    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);
    const radius = radiusStr ? parseFloat(radiusStr) : 5;

    return this.parkingService.findNearby(lat, lng, radius);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ParkingLotResponse> {
    const lot = await this.parkingService.findOne(id);
    if (!lot) {
      throw new NotFoundException(`Parking lot with ID ${id} not found`);
    }
    return lot;
  }
}
