import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { BookingService } from './booking.service';
import { JwtGuard } from '../auth/jwt.guard';

@Controller('api/booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('slots/:lotId')
  async getSlots(@Param('lotId') lotId: string) {
    return this.bookingService.getSlots(lotId);
  }

  @Get('history')
  @UseGuards(JwtGuard)
  async getBookingHistory(@Req() req: any) {
    return this.bookingService.getBookingHistory(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  async getBookingDetails(@Param('id') id: string) {
    return this.bookingService.getBookingDetails(id);
  }

  @Post('create')
  @UseGuards(JwtGuard)
  async createBooking(@Req() req: any, @Body() body: any) {
    return this.bookingService.createBooking(req.user.id, body);
  }

  @Post('cancel/:id')
  @UseGuards(JwtGuard)
  async cancelBooking(@Req() req: any, @Param('id') id: string) {
    return this.bookingService.cancelBooking(req.user.id, id);
  }

  @Post('simulate-scan')
  async simulateScan(@Body() body: { bookingId: string; action: 'ENTRY' | 'EXIT' }) {
    return this.bookingService.simulateScan(body);
  }
}
