import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModuleDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  readonly name: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  readonly description?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  readonly icon?: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ required: true, default: 0, examples: [0, 1, 2] })
  readonly type: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: true })
  readonly visible?: boolean;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  readonly ruteUi?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: false })
  readonly superAdmin?: boolean;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({ required: true, default: 0, examples: [0, 1, 2, 3] })
  readonly priority: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    required: false,
    description: 'Parent module ID for hierarchical structure',
  })
  readonly parentId?: string;
}
