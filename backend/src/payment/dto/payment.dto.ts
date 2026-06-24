import { IsString, IsNumber, IsOptional, IsPositive, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({ example: 'uuid-of-booking' })
  @IsString()
  bookingId: string;

  @ApiProperty({ example: 100 })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiPropertyOptional({ example: 'ch_3Mv...' })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiPropertyOptional({ example: 'stripe' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ enum: ['PENDING', 'COMPLETED', 'FAILED'], default: 'PENDING' })
  @IsOptional()
  @IsIn(['PENDING', 'COMPLETED', 'FAILED'])
  status?: string;
}
