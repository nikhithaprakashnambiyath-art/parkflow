import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddVehicleDto {
  @ApiProperty({ example: 'KL-01-CA-1234' })
  @IsString()
  @IsNotEmpty()
  plateNumber: string;

  @ApiProperty({ example: 'Car' })
  @IsString()
  @IsNotEmpty()
  type: string;
}
