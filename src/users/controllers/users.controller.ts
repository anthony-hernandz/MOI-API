import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { UsersService } from '@users/services';
import { paginationUsersDTO, createUserDTO, updateUserDTO } from '@users/dtos';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiResponse({ status: HttpStatus.OK })
  @ApiOperation({ summary: 'List all users' })
  @Get()
  async findAll(@Query() paramsUsers: paginationUsersDTO) {
    return await this.usersService.findAll(paramsUsers);
  }

  @ApiResponse({ status: HttpStatus.CREATED })
  @ApiOperation({ summary: 'Create a user' })
  @Post()
  async create(@Body() data: createUserDTO) {
    return await this.usersService.create(data);
  }

  @ApiResponse({ status: HttpStatus.OK })
  @ApiOperation({ summary: 'Update a user' })
  @Put('/:id')
  async update(@Param() id: string, @Body() data: updateUserDTO) {
    return await this.usersService.update(id, data);
  }

  @ApiResponse({ status: HttpStatus.OK })
  @ApiOperation({ summary: 'List a user' })
  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @ApiResponse({ status: HttpStatus.OK })
  @ApiOperation({ summary: 'Delete a user' })
  @Delete('/:id')
  async delete(@Param('id') id: string) {
    return await this.usersService.delete(id);
  }
}
