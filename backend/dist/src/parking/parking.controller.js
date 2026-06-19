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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParkingController = void 0;
const common_1 = require("@nestjs/common");
const parking_service_1 = require("./parking.service");
let ParkingController = class ParkingController {
    parkingService;
    constructor(parkingService) {
        this.parkingService = parkingService;
    }
    async search(query, latStr, lngStr, radiusStr, priceStr, availStr, evChargingStr, coveredStr, securityStr, accessibilityStr) {
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
    async nearby(latStr, lngStr, radiusStr) {
        if (!latStr || !lngStr) {
            throw new common_1.NotFoundException('lat and lng query parameters are required for nearby search');
        }
        const lat = parseFloat(latStr);
        const lng = parseFloat(lngStr);
        const radius = radiusStr ? parseFloat(radiusStr) : 5;
        return this.parkingService.findNearby(lat, lng, radius);
    }
    async findOne(id) {
        const lot = await this.parkingService.findOne(id);
        if (!lot) {
            throw new common_1.NotFoundException(`Parking lot with ID ${id} not found`);
        }
        return lot;
    }
};
exports.ParkingController = ParkingController;
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Query)('query')),
    __param(1, (0, common_1.Query)('lat')),
    __param(2, (0, common_1.Query)('lng')),
    __param(3, (0, common_1.Query)('radius')),
    __param(4, (0, common_1.Query)('price')),
    __param(5, (0, common_1.Query)('availability')),
    __param(6, (0, common_1.Query)('evCharging')),
    __param(7, (0, common_1.Query)('covered')),
    __param(8, (0, common_1.Query)('security')),
    __param(9, (0, common_1.Query)('accessibility')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ParkingController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('nearby'),
    __param(0, (0, common_1.Query)('lat')),
    __param(1, (0, common_1.Query)('lng')),
    __param(2, (0, common_1.Query)('radius')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ParkingController.prototype, "nearby", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ParkingController.prototype, "findOne", null);
exports.ParkingController = ParkingController = __decorate([
    (0, common_1.Controller)('api/parking'),
    __metadata("design:paramtypes", [parking_service_1.ParkingService])
], ParkingController);
//# sourceMappingURL=parking.controller.js.map