import { Controller, Get, Post, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VehicleService } from './vehicle.service';
import { JwtGuard } from '../auth/jwt.guard';
import { AddVehicleDto } from './dto/vehicle.dto';

@ApiTags('Vehicles')
@Controller('api/vehicles')
@UseGuards(JwtGuard)
@ApiBearerAuth()
export class VehicleController {
  constructor(private readonly vehicleService: VehicleService) {}

  @Get()
  @ApiOperation({ summary: 'Get all registered vehicles of current user' })
  async getVehicles(@Req() req: any) {
    return this.vehicleService.getVehicles(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Register a new vehicle' })
  async addVehicle(@Req() req: any, @Body() body: AddVehicleDto) {
    return this.vehicleService.addVehicle(req.user.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'De-register a vehicle by id' })
  async removeVehicle(@Req() req: any, @Param('id') id: string) {
    return this.vehicleService.removeVehicle(req.user.id, id);
  }
}
