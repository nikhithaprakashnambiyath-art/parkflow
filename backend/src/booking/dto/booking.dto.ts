import { IsString, IsNumber, IsDateString, IsPositive } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'uuid-of-slot' })
  @IsString()
  slotId: string;

  @ApiProperty({ example: '2025-01-10T09:00:00.000Z' })
  @IsDateString()
  startTimeStr: string;

  @ApiProperty({ example: '2025-01-10T11:00:00.000Z' })
  @IsDateString()
  endTimeStr: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  amount: number;
}

export class ScanDto {
  @ApiProperty({ example: 'uuid-of-booking' })
  @IsString()
  bookingId: string;

  @ApiProperty({ enum: ['ENTRY', 'EXIT'] })
  @IsString()
  action: 'ENTRY' | 'EXIT';
}
