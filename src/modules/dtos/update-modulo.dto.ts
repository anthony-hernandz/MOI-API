import { PartialType } from '@nestjs/swagger';
import { CreateModuleDTO } from './create-modulo.dto';

export class UpdateModuloDto extends PartialType(CreateModuleDTO) {}
