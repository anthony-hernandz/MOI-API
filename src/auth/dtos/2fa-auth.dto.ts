import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class TwoFactorAuthDto {
  @ApiProperty({
    description: 'Código generado desde app google authenticator',
  })
  @IsNotEmpty()
  @IsString()
  readonly codigo: string;

  @ApiProperty({
    description: 'Correo electrónico del usuario',
  })
  @IsNotEmpty()
  @IsString()
  readonly email: string;
}
