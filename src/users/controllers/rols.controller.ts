import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import {
  Controller,
  UseGuards,
  HttpStatus,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { paginationRolsDTO } from '@users/dtos';
import { RolsService } from '@users/services';

@ApiTags('Rols')
@ApiBearerAuth()
@Controller('rols')
@UseGuards(JwtAuthGuard)
export class RolsController {
  constructor(private readonly rolService: RolsService) {}

  @ApiResponse({ status: HttpStatus.OK })
  @ApiOperation({ summary: 'List all rols' })
  @Get()
  async findAll(@Query() pagination: paginationRolsDTO) {
    return this.rolService.findAll(pagination);
  }

  @ApiResponse({ status: HttpStatus.OK })
  @ApiOperation({ summary: 'List one rol' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.rolService.findOne(id);
  }
}
