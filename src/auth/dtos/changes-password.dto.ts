import { IsNotEmpty, IsString } from 'class-validator';

export class CambiarPasswordResetDto {
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsString()
  @IsNotEmpty()
  readonly token: string;
}
