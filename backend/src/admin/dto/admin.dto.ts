import { IsString, IsNotEmpty, IsNumber, IsOptional, IsBoolean, IsPositive, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLocationDto {
  @ApiProperty({ example: 'Kochi Mall Parking' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Kochi, Kerala' })
  @IsString()
  @IsNotEmpty()
  location: string;

  @ApiPropertyOptional({ example: '{"lat": 9.9312, "lng": 76.2673}' })
  @IsOptional()
  @IsString()
  coordinates?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  pricing?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  pricePerHour?: number;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  totalSlots: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  availableSlots?: number;
}

export class UpdateLocationDto {
  @ApiPropertyOptional({ example: 'Kochi Mall Parking' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ example: 'Kochi, Kerala' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  location?: string;

  @ApiPropertyOptional({ example: '{"lat": 9.9312, "lng": 76.2673}' })
  @IsOptional()
  @IsString()
  coordinates?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  pricing?: number;
}

export class CreatePricingRuleDto {
  @ApiProperty({ example: 1.5 })
  @IsNumber()
  @IsPositive()
  multiplier: number;

  @ApiProperty({ example: '18:00' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '22:00' })
  @IsString()
  @IsNotEmpty()
  endTime: string;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ example: 'COMPLETED' })
  @IsString()
  @IsNotEmpty()
  status: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  isSuspended: boolean;
}
