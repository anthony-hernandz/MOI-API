import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TokenService } from '../services';
import { sessionUser } from '@common/class/userSession.class';

@Injectable()
export class TokenMiddleware implements NestMiddleware {
  constructor(
    private readonly tokenService: TokenService,
    private _sessionUser: sessionUser,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const token = req.headers['authorization']?.split(' ')[1];

    if (token) {
      const { user } = await this.tokenService.validExpiration(token);
      this._sessionUser.idUser = user?.id;
    }
    next();
  }
}
