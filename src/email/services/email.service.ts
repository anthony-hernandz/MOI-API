import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotAcceptableException,
} from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { MntUsers } from '@users/entities';
import { RestoreAccountService } from '@users/services';
import { envs } from '@config/envs';
import { QueryRunner } from 'typeorm';

@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    @Inject(forwardRef(() => RestoreAccountService))
    private recuperacionCuentaService: RestoreAccountService,
  ) {}

  async sendUserConfirmation(user: MntUsers, ip: string) {
    try {
      const url = await this.recuperacionCuentaService.create(
        user,
        ip,
        '/auth/reestablecer-password/',
      );
      if (url != '') {
        await this.mailerService.sendMail({
          to: user.email,
          subject: 'API - Restablecer contraseña',
          template: '../templates',
          context: {
            name: user.email.toString(),
            url: url,
          },
          attachments: [],
        });
        return {
          status: true,
        };
      } else {
        throw new ConflictException('Error al enviar el email');
      }
    } catch (error) {
      console.log('erorrrrrrrr000', error);
      throw new NotAcceptableException(`Error al enviar el email` + error);
    }
  }

  async sendEmailUserCreated(
    user: MntUsers,
    pass: string,
    ip: string,
    queryRunner?: QueryRunner,
  ) {
    try {
      await this.recuperacionCuentaService.create(
        user,
        ip,
        '/auth/reestablecer-password/',
        queryRunner,
      );

      await this.mailerService.sendMail({
        to: user.email,
        subject: 'API - Registro de usuario',
        template: '../templates',
        context: {
          name: user.email.toString(),
          password: pass,
          url: envs.baseUrlApplicationFront,
        },
        attachments: [],
      });
      return {
        status: true,
      };
    } catch (error) {
      throw new NotAcceptableException(`Error al enviar el email` + error);
    }
  }

  async sendEmailQRTwoFactorAuth(user: MntUsers, qrCode: string) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'API - Código de verificación',
        template: '../templates/', // crear template .hbs
        context: {
          name: user.email.toString(),
          imageUrl: 'cid:unique-qr-code', // Referencia a la imagen
        },
        attachments: [
          {
            filename: 'qrcode.png',
            path: qrCode,
            cid: 'unique-qr-code', // Content-ID para usar en el HTML
          },
        ],
      });
    } catch (error) {
      throw new NotAcceptableException(
        `Error al enviar el email` + error?.message,
      );
    }
  }
}
