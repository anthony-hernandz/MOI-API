import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as moment from 'moment-timezone';
import { envs } from '@config/envs';
import { authenticator } from 'otplib';
import * as QRCode from 'qrcode';
import * as path from 'path';

import { TokenService } from './token.service';
import { RestoreAccountService, UsersService } from '@users/services';
import { PermissionsService } from '@modules/services';
import { MntUsers } from '@users/entities';
import { IRefreshToken, IScopes, IToken } from '../interfaces';
import { TwoFactorAuthDto } from '@auth/dtos/2fa-auth.dto';
import { EmailService } from '@email/services/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    private readonly permissionsService: PermissionsService,
    private readonly restoreAccountService: RestoreAccountService,
    private readonly mailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<MntUsers> {
    const user = await this.usersService.findByEmail(email);
    if (user && user.active) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        return user;
      }
    }
    return null;
  }

  async login(user: MntUsers) {
    const scope: IScopes[] =
      await this.permissionsService.getPermissionsForScope(user);

    const dataToken: IToken = { rol: user.rol?.id, sub: user.id, scope };
    const token = await this.tokenService.createJWTToken(
      dataToken,
      envs.jwtExpiration,
      envs.jwtSecret,
    );

    // olds tokens
    await this.logout(user);

    const { amount, unit } = this.tokenService.parseExpirationJwt(
      envs.jwtExpiration,
    );

    const savedToken = await this.tokenService.create({
      userId: user.id,
      token,
      expirationTime: moment()
        .tz('America/El_Salvador')
        .add(amount, unit)
        .format(),
    });

    if (envs.jwtUseRefreshToken) {
      const dataRefreshToken: IRefreshToken = {
        rol: user.rol?.id + token,
        sub: user.id + token,
      };
      const refreshToken = await this.tokenService.createJWTToken(
        dataRefreshToken,
        envs.jwtRefreshExpiration,
        envs.jwtSecret,
      );

      const { amount, unit } = this.tokenService.parseExpirationJwt(
        envs.jwtRefreshExpiration,
      );

      await this.tokenService.update(savedToken.token, {
        userId: user.id,
        refreshToken: refreshToken,
        refreshExpirationTime: moment()
          .tz('America/El_Salvador')
          .add(amount, unit)
          .format(),
      });
    }

    return {
      user: this.usersService.parseUserForLogin(user),
      token,
    };
  }

  async logout(user: MntUsers): Promise<void> {
    await this.tokenService.desactiveTokensByUser(user.id);
  }

  async loginWith2fa(data: TwoFactorAuthDto) {
    const { email, codigo } = data;
    const user = await this.usersService.findByEmail(email);
    if (envs.twoFactorAuthentication && user.twoFactorEnabled) {
      const codeValid: boolean =
        await this.usersService.isTwoFactorAuthenticationCodeValid(
          codigo,
          user,
        );

      if (!codeValid) {
        throw new BadRequestException('Código de autenticación inválido');
      }

      //TODO: SI SE DESEA UTLIZAR GUARD DE 2FACTOR EN ENDPOINTS
      //
      // this.jwtService.sign(payload);
    }
    const scope: IScopes[] =
      await this.permissionsService.getPermissionsForScope(user);

    const payload: IToken = {
      rol: user.rol?.name,
      sub: user.id,
      scope,
      twoFactorAuthentication: true,
    };

    const token: string = await this.tokenService.createJWTToken(
      payload,
      envs.jwtExpiration,
      envs.jwtSecret,
    );
    return {
      access_token: token,
      user: {
        email: user.email,
      },
    };
  }

  async generateTwoFactorAuthenticationSecret(user: MntUsers) {
    const secret: string = authenticator.generateSecret();

    const otpauthUrl: string = authenticator.keyuri(user.email, 'API', secret);

    await this.usersService.setTwoFactorAuthenticationSecret(user.id, secret);

    return {
      secret,
      otpauthUrl,
    };
  }

  async generateQrCodeFile(data: string): Promise<string> {
    const filePath = path.join(__dirname, 'qr-code.png');
    return new Promise((resolve, reject) => {
      QRCode.toFile(filePath, data, { width: 200 }, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(filePath);
        }
      });
    });
  }

  async resetQrCode(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException(
        'No se encontró un usuario con el email proporcionado.',
      );
    }

    const { otpauthUrl } =
      await this.generateTwoFactorAuthenticationSecret(user);

    const qrCodeUrl: string = await this.generateQrCodeFile(otpauthUrl);
    await this.mailService.sendEmailQRTwoFactorAuth(user, qrCodeUrl);

    return { message: 'Código QR Reenviado existosamente' };
  }

  async recoverPassword(id: string, ip: string) {
    const usuario = await this.usersService.findOne(id);
    return await this.mailService.sendUserConfirmation(usuario, ip);
  }

  async verifyRecoverPassword(token: string) {
    return await this.restoreAccountService.searchToken(token);
  }

  async verifyAccount(id: string, ip: string) {
    const usuario = await this.usersService.findOne(id);

    const password = await this.usersService.RestorePasswordForAdmin(id);
    return await this.mailService.sendEmailUserCreated(usuario, password, ip);
  }
}
