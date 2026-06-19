import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { VehicleService } from './vehicle.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('api/vehicles')
@UseGuards(JwtGuard)
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  async getVehicles(@Req() req: any) {
    return this.vehicleService.getVehicles(req.user.id);
  }

  @Post()
  async addVehicle(@Req() req: any, @Body() body: any) {
    return this.vehicleService.addVehicle(req.user.id, body);
  }

  @Delete(':id')
  async removeVehicle(@Req() req: any, @Param('id') id: string) {
    return this.vehicleService.removeVehicle(req.user.id, id);
  }
}
