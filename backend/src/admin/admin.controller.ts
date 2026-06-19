import { Controller, Get, Post, Body, Param, Put, Req, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/admin')
@UseGuards(JwtGuard, RolesGuard)
@Roles('ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboardMetrics() {
    return this.adminService.getDashboardMetrics();
  }

  @Get('revenue')
  async getRevenueReport() {
    return this.adminService.getRevenueReport();
  }

  @Post('location')
  async createLocation(@Body() body: any) {
    return this.adminService.createLocation(body);
  }

  @Post('location/:lotId/pricing-rules')
  async createPricingRule(@Param('lotId') lotId: string, @Body() body: any) {
    return this.adminService.createPricingRule(lotId, body);
  }

  @Get('location/:lotId/pricing-rules')
  async getPricingRules(@Param('lotId') lotId: string) {
    return this.adminService.getPricingRules(lotId);
  }

  @Get('bookings')
  async getAllBookings() {
    return this.adminService.getAllBookings();
  }

  @Post('booking/:id/status')
  async updateBookingStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.adminService.updateBookingStatus(id, status);
  }

  @Get('users')
  async getAllUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('users/:id/status')
  async updateUserStatus(@Param('id') id: string, @Body('isSuspended') isSuspended: boolean) {
    return this.adminService.updateUserStatus(id, isSuspended);
  }
}
