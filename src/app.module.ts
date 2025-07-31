import { Module } from '@nestjs/common';
import { DatabaseModule } from '@database/database.module';
import { FilesModule } from '@files/files.module';
import { AuthModule } from '@auth/auth.module';
import { EmailModule } from '@email/email.module';
import { BitacoraModule } from './bitacora/bitacora.module';
import { UsersModule } from '@users/users.module';
import { ModulesModule } from '@modules/modules.module';
import { CommonModule } from '@common/common.module';

@Module({
  imports: [
    DatabaseModule,
    FilesModule,
    AuthModule,
    EmailModule,
    BitacoraModule,
    UsersModule,
    ModulesModule,
    CommonModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
