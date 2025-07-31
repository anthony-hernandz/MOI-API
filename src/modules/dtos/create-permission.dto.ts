import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePermissionDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  readonly name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  readonly description?: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  readonly endpoint: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  readonly method: string;
}
