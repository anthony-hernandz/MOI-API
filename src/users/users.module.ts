import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@auth/auth.module';
import { UsersService, RolsService, RestoreAccountService } from './services';
import { UsersController, RolsController } from './controllers';
import * as usersEntities from './entities';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    TypeOrmModule.forFeature(Object.values(usersEntities).flat()),
  ],
  controllers: [
    // Importar controladores necesarios para el manejo de usuarios
    UsersController,
    RolsController,
  ],
  providers: [UsersService, RolsService, RestoreAccountService],
  exports: [UsersService, RolsService, RestoreAccountService],
})
export class UsersModule {}
