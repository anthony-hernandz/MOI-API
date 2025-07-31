import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class SavePermissionsUserDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true, description: 'The user id' })
  readonly idUser: string;

  @IsNotEmpty()
  @IsArray()
  @Type(() => String)
  @ArrayMinSize(1)
  @ApiProperty({
    required: true,
    description: 'Array of permission ids to associate with user',
    type: [String],
  })
  readonly modules: string[];
}
