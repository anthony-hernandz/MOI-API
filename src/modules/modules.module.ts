import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ModulesService,
  PermissionsService,
  TreeBuilderService,
} from './services';
import { ModulesController, PermissionController } from './controllers';
import * as modulesEntities from './entities';
import { UsersModule } from '@users/users.module';
import { AuthModule } from '@auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature(Object.values(modulesEntities).flat()),
    UsersModule,
    forwardRef(() => AuthModule),
  ],
  providers: [ModulesService, PermissionsService, TreeBuilderService],
  exports: [ModulesService, PermissionsService],
  controllers: [ModulesController, PermissionController],
})
export class ModulesModule {}
