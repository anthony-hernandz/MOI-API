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
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { PermissionsService } from '@modules/services';
import {
  PermissionsPaginateDto,
  UpdatePermisssionDto,
  CreatePermissionDTO,
  SavePermissionsRolDTO,
  SavePermissionsModule,
  SavePermissionsUserDTO,
} from '@modules/dtos';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';

@ApiTags('Permissions')
@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all permissions',
  })
  @ApiOperation({ summary: 'Get all permissions' })
  @Get()
  async findAll(@Query() params: PermissionsPaginateDto) {
    return await this.permissionsService.findAllPermissions(params);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
  })
  @ApiOperation({ summary: 'Create permission' })
  @Post()
  async createPermission(@Body() permission: CreatePermissionDTO) {
    return await this.permissionsService.createPermission(permission);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all permissions by rol',
  })
  @ApiOperation({ summary: 'Get all permissions by rol' })
  @Get('modules/rol/:id')
  async getPermissionsByRol(@Param('id') id: string) {
    return await this.permissionsService.getPermissionsActivesByRol(id);
  }

  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Get all permissions by user',
  })
  @ApiOperation({ summary: 'Get all permissions by user' })
  @Get('modules/user/:id')
  async getPermissionsByUser(@Param('id') id: string) {
    return await this.permissionsService.getPermissionsActivesByUser(id);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Asociate permissions with a module',
  })
  @ApiOperation({ summary: 'Asociate permissions by module' })
  @Post('module')
  async savePermissionsModule(@Body() permissions: SavePermissionsModule) {
    return await this.permissionsService.asociatePermissions(permissions);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: '',
  })
  @ApiOperation({ summary: 'Save permissions by rol' })
  @Post('rol')
  async savePermissionsByRol(@Body() permissions: SavePermissionsRolDTO) {
    return await this.permissionsService.savePermissionsRol(permissions);
  }

  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Get permissions by user',
  })
  @ApiOperation({ summary: 'Get permissions by user' })
  @Post('user')
  async savePermissionsByUser(@Body() permissions: SavePermissionsUserDTO) {
    return await this.permissionsService.savePermissionsUser(permissions);
  }

  @ApiResponse({
    status: HttpStatus.OK,
  })
  @ApiOperation({ summary: 'Update permission' })
  @Put(':id')
  async updatePermission(
    @Param('id') id: string,
    @Body() permission: UpdatePermisssionDto,
  ) {
    return await this.permissionsService.updatePermission(id, permission);
  }
}
