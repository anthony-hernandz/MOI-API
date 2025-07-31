import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class createUserDTO {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: true })
  public readonly email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  public readonly password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  public readonly idRol: string;
}
