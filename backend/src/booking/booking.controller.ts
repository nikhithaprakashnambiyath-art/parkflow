import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { BookingService } from './booking.service';
import { JwtGuard } from '../auth/jwt.guard';
import { CreateBookingDto, ScanDto } from './dto/booking.dto';

@ApiTags('Bookings')
@Controller('api/booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('slots/:lotId')
  @ApiOperation({ summary: 'Get all slots for a parking lot' })
  async getSlots(@Param('lotId') lotId: string) {
    return this.bookingService.getSlots(lotId);
  }

  @Get('history')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking history for authenticated user' })
  async getBookingHistory(@Req() req: any) {
    return this.bookingService.getBookingHistory(req.user.id);
  }

  @Get(':id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get booking details by ID' })
  async getBookingDetails(@Param('id') id: string) {
    return this.bookingService.getBookingDetails(id);
  }

  @Post('create')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new parking booking' })
  async createBooking(@Req() req: any, @Body() body: CreateBookingDto) {
    return this.bookingService.createBooking(req.user.id, body);
  }

  @Post('cancel/:id')
  @UseGuards(JwtGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a booking' })
  async cancelBooking(@Req() req: any, @Param('id') id: string) {
    return this.bookingService.cancelBooking(req.user.id, id);
  }

  @Post('simulate-scan')
  @ApiOperation({ summary: 'Simulate gate QR scan (entry/exit)' })
  async simulateScan(@Body() body: ScanDto) {
    return this.bookingService.simulateScan(body);
  }
}
