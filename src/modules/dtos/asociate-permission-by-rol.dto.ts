import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SavePermissionsRolDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, description: 'The rol id' })
  readonly idRol: string;

  @IsNotEmpty()
  @IsArray()
  @Type(() => String)
  @ArrayMinSize(1)
  @ApiProperty({
    required: true,
    description: 'Array of modules ids to associate with the rol',
    type: [String],
  })
  readonly modules: string[];
}
