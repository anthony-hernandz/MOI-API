import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { TokenMiddleware } from './middlewares/token.middleware';
import { AuthService, TokenService } from './services';
import { JwtStrategy, LocalStrategy } from './strategies';
import { AuthController } from './controllers/auth.controller';
import * as authEntities from './entities';
import { sessionUser } from '@common/class/userSession.class';
import { UsersModule } from '@users/users.module';
import { ModulesModule } from '@modules/modules.module';
import { EmailModule } from '@email/email.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({}),
    }),
    TypeOrmModule.forFeature(Object.values(authEntities).flat()),
    forwardRef(() => UsersModule),
    forwardRef(() => ModulesModule),
    PassportModule,
    EmailModule,
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    TokenService,
    sessionUser,
  ],
  controllers: [AuthController],
  exports: [sessionUser, AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TokenMiddleware)
      .forRoutes({ path: '/*', method: RequestMethod.ALL });
  }
}
