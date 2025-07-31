import { OmitType, PartialType } from '@nestjs/swagger';
import { createUserDTO } from '@users/dtos/create-user.dto';

export class updateUserDTO extends OmitType(PartialType(createUserDTO), [
  'password',
]) {}
