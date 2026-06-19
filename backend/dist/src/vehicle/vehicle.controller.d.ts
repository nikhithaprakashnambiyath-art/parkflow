import { VehicleService } from './vehicle.service';
export declare class VehicleController {
    private readonly vehicleService;
    constructor(vehicleService: VehicleService);
    getVehicles(req: any): Promise<any[]>;
    addVehicle(req: any, body: any): Promise<{
        id: string;
        userId: string;
        plateNumber: any;
        type: any;
        createdAt: Date;
    }>;
    removeVehicle(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
