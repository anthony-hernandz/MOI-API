import { IScopes } from '@auth/interfaces/scopes.interface';

export interface IToken {
  rol: string;
  sub: string;
  scope?: Array<IScopes>;
  twoFactorAuthentication?: boolean;
}
