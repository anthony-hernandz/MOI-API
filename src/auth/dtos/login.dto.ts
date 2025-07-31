import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class loginDTO {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: true })
  readonly email: string;

  @IsNotEmpty()
  @ApiProperty({ required: true })
  readonly password: string;
}
