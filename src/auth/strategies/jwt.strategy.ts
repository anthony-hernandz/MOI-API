import { ForbiddenException, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

import { envs } from '@config/envs';
import { ModulesService } from '@modules/services';
import { sessionUser } from '@common/class/userSession.class';
import { IToken, IScopes } from '../interfaces';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly moduleService: ModulesService,
    private _sessionUser: sessionUser,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: envs.jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(request: Request, payload: IToken) {
    //const idUser: string = payload['sub'];
    const scopes: IScopes[] = payload['scope'] || [];

    const endpoint: string = request.route.path;
    const method: string = request.method;

    const hasAccess = scopes.some(
      (scope) => scope?.endpoint === endpoint && scope?.method === method,
    );

    if (!hasAccess) {
      throw new ForbiddenException(
        'You do not have permission to access this route',
      );
    }

    return true;
  }
}
