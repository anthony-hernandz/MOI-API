import { PartialType } from '@nestjs/swagger';
import { CreatePermissionDTO } from './create-permission.dto';

export class UpdatePermisssionDto extends PartialType(CreatePermissionDTO) {}
