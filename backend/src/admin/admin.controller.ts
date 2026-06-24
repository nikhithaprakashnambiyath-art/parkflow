import { Controller, Get, Post, Body, Param, Put, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateLocationDto, UpdateLocationDto, CreatePricingRuleDto, UpdateBookingStatusDto, UpdateUserStatusDto } from './dto/admin.dto';

@ApiTags('Admin')
@Controller('api/admin')
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overall admin dashboard metrics' })
  async getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue report by parking lot location' })
  async getRevenueReport() {
    return this.adminService.getRevenueReport();
  }

  @Post('location')
  @ApiOperation({ summary: 'Create a new parking lot location' })
  async createLocation(@Body() body: CreateLocationDto) {
    return this.adminService.createLocation(body);
  }

  @Put('location/:lotId')
  @ApiOperation({ summary: 'Update an existing parking lot location' })
  async updateLocation(@Param('lotId') lotId: string, @Body() body: UpdateLocationDto) {
    return this.adminService.updateLocation(lotId, body);
  }

  @Post('location/:lotId/pricing-rules')
  @ApiOperation({ summary: 'Create a dynamic pricing rule for a parking lot location' })
  async createPricingRule(@Param('lotId') lotId: string, @Body() body: CreatePricingRuleDto) {
    return this.adminService.createPricingRule(lotId, body);
  }

  @Get('location/:lotId/pricing-rules')
  @ApiOperation({ summary: 'Get all dynamic pricing rules for a parking lot location' })
  async getPricingRules(@Param('lotId') lotId: string) {
    return this.adminService.getPricingRules(lotId);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get all booking records for admin management' })
  async getAllBookings() {
    return this.adminService.getAllBookings();
  }

  @Post('booking/:id/status')
  @ApiOperation({ summary: 'Update a booking status' })
  async updateBookingStatus(@Param('id') id: string, @Body() body: UpdateBookingStatusDto) {
    return this.adminService.updateBookingStatus(id, body.status);
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all registered users for admin management' })
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('users/:id/status')
  @ApiOperation({ summary: 'Suspend or activate a user account' })
  async updateUserStatus(@Param('id') id: string, @Body() body: UpdateUserStatusDto) {
    return this.adminService.updateUserStatus(id, body.isSuspended);
  }
}
