import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/swagger';

export class CreateTokenDTO {
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @IsString()
  @IsNotEmpty()
  readonly expirationTime: string;

  @IsString()
  @IsNotEmpty()
  readonly userId: string;
}

export class UpdateTokenDTO extends PartialType(CreateTokenDTO) {
  @IsString()
  @IsOptional()
  readonly refreshToken: string;

  @IsString()
  @IsOptional()
  readonly refreshExpirationTime: string;
}
