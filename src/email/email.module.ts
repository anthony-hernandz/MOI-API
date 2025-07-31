import { forwardRef, Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { envs } from '@config/envs';
import { join } from 'path';
import { EmailService } from './services/email.service';
import { UsersModule } from '@users/users.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: envs.smtpHost,
          port: envs.smtpPort,
          secure: false,
          auth: {
            user: envs.smtpUser,
            pass: envs.smtpPass,
          },
          tls: {
            ciphers: 'SSLv3',
          },
        },
        defaults: {
          from: `"No contestar, " <${envs.emailFrom}>`,
        },
        template: {
          dir: join(__dirname, './templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  exports: [EmailModule, EmailService],
  providers: [EmailService],
})
export class EmailModule {}
