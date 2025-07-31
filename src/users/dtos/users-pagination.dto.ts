import { paginationDto } from '@common/dtos/pagination.dto';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class paginationUsersDTO extends paginationDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  public readonly email: string;
}
