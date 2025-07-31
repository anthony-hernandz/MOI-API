import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '@auth/guards/jwt.guard';
import { AuthGuard } from '@nestjs/passport';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Public } from '@auth/decorators/public.decorator';
import { AuthService } from '@auth/services/auth.service';
import { MntUsers } from '@users/entities';
import {
  loginDTO,
  CambiarPasswordResetDto,
  TwoFactorAuthDto,
} from '@auth/dtos';
import { UsersService } from '@users/services';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: loginDTO,
  })
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: Request) {
    return this.authService.login(req.user as MntUsers);
  }

  @Public()
  @Post('2fa/authenticate')
  @HttpCode(HttpStatus.OK)
  authenticate(@Body() data: TwoFactorAuthDto) {
    return this.authService.loginWith2fa(data);
  }

  @Public()
  @Post('2fa/reset-qr')
  @HttpCode(HttpStatus.OK)
  resetCodeQr(@Body() email: string) {
    return this.authService.resetQrCode(email);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/recuperar-password/:id')
  recuperarPassword(@Ip() ip: string, @Param('id') id: string) {
    return this.authService.recoverPassword(id, ip);
  }

  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('/reestablecer-password')
  reestablecerPassword(@Body() token: string) {
    return this.authService.verifyRecoverPassword(token);
  }

  @Public()
  @HttpCode(HttpStatus.ACCEPTED)
  @Post('/change-password-reset/')
  changePasswordReset(@Body() payload: CambiarPasswordResetDto) {
    return this.userService.changePasswordReset(payload);
  }
}
