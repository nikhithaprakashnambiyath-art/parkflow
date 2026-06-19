import { ParkingService, ParkingLotResponse } from './parking.service';
export declare class ParkingController {
    private readonly parkingService;
    constructor(parkingService: ParkingService);
    search(query?: string, latStr?: string, lngStr?: string, radiusStr?: string, priceStr?: string, availStr?: string, evChargingStr?: string, coveredStr?: string, securityStr?: string, accessibilityStr?: string): Promise<ParkingLotResponse[]>;
    nearby(latStr: string, lngStr: string, radiusStr?: string): Promise<ParkingLotResponse[]>;
    findOne(id: string): Promise<ParkingLotResponse>;
}
