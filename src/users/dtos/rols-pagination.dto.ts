import { paginationDto } from '@common/dtos/pagination.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class paginationRolsDTO extends paginationDto {
  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  readonly name: string;
}
