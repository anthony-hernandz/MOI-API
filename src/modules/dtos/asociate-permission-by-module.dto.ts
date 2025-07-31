import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SavePermissionsModule {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, description: 'The module id' })
  readonly idModule: string;

  @IsNotEmpty()
  @IsArray()
  @Type(() => String)
  @ArrayMinSize(1)
  @ApiProperty({
    required: true,
    description: 'Array of permission ids to associate with the module',
    type: [String],
  })
  readonly permissions: string[];
}
