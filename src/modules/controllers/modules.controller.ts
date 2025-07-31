import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ModulesService } from '@modules/services';
import {
  ModulosPaginationDto,
  CreateModuleDTO,
  UpdateModuloDto,
} from '@modules/dtos';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { Public } from '@auth/decorators/public.decorator';

@ApiTags('Modules')
@Controller('modules')
@UseGuards(JwtAuthGuard)
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all modules',
  })
  @ApiOperation({ summary: 'Get all modules' })
  async find(@Query() params: ModulosPaginationDto) {
    return await this.modulesService.findAll(params);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiOperation({ summary: 'Create module' })
  @Post()
  async createModule(@Body() module: CreateModuleDTO) {
    return await this.modulesService.create(module);
  }

  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiOperation({ summary: 'Update module' })
  @Put(':id')
  async updateModule(@Param('id') id: string, @Body() module: UpdateModuloDto) {
    return await this.modulesService.update(id, module);
  }

  @Public()
  @Get('user')
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all modules with their menus',
  })
  @ApiOperation({ summary: 'Get all modules with their menus' })
  async getModulesWithMenus() {
    return await this.modulesService.getMenuByUser();
  }
}
