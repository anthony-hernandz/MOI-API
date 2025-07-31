import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as moment from 'moment-timezone';
import { v4 as uuid } from 'uuid';

import { envs } from '@config/envs';
import { MntTokens } from '../entities';
import { CreateTokenDTO, UpdateTokenDTO } from '../dtos';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(MntTokens)
    private readonly tokensRepository: Repository<MntTokens>,
    private readonly jwtService: JwtService,
  ) {}

  async findOne(token: string): Promise<MntTokens> {
    const findToken: MntTokens = await this.tokensRepository.findOne({
      where: {
        token,
        active: true,
      },
      relations: { user: true },
    });

    if (!findToken) {
      throw new NotFoundException('Invalid token');
    }
    return findToken;
  }

  async validExpiration(token: string): Promise<MntTokens> {
    const existToken = await this.tokensRepository.findOne({
      where: { token },
      relations: { user: true },
    });
    if (!existToken) throw new UnauthorizedException();
    const nowTime: number = moment().tz('America/El_Salvador').valueOf();
    const dateToken: number = moment(existToken.expirationTime).valueOf();

    if (dateToken <= nowTime) {
      if (!envs.jwtUseRefreshToken) {
        throw new UnauthorizedException();
      }
      const dateRefreshToken: number = moment(
        existToken.refreshExpirationTime,
      ).valueOf();

      if (dateRefreshToken <= nowTime) {
        throw new UnauthorizedException();
      }

      //update date valid for token
      await this.updateTimeToken(existToken.id);
    }

    return existToken;
  }

  async createJWTToken(
    payload: any,
    timeExpired: string,
    secretKey: string,
  ): Promise<string> {
    return this.jwtService.sign(payload, {
      secret: secretKey,
      expiresIn: timeExpired,
    });
  }

  async ValidToken(token: string, secretKey: string) {
    try {
      return this.jwtService.verify(token, {
        secret: secretKey,
      });
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  async create(createToken: CreateTokenDTO) {
    const { userId, ...data } = createToken;
    const token: MntTokens = this.tokensRepository.create({
      id: uuid(),
      active: true,
      ...data,
      user: {
        id: userId,
      },
      createAt: moment().tz('America/El_Salvador').format(),
    });
    await this.tokensRepository.save(token);
    return token;
  }

  async update(token: string, updateToken: UpdateTokenDTO) {
    const { userId, ...data } = updateToken;
    const { id }: MntTokens = await this.findOne(token);

    const updated: MntTokens = await this.tokensRepository.preload({
      id,
      user: { id: userId },
      ...data,
      updateAt: moment().tz('America/El_Salvador').format(),
    });
    await this.tokensRepository.save(updated);
    return updated;
  }

  async desactiveTokensByUser(userId: string): Promise<void> {
    const [tokens, count] = await this.tokensRepository.findAndCount({
      where: {
        user: { id: userId },
        active: true,
      },
    });

    if (!!count) {
      await this.tokensRepository
        .createQueryBuilder('tokens')
        .update<MntTokens>(MntTokens, { active: false })
        .where('id IN (:...ids)', {
          ids: tokens.map((token: MntTokens) => token.id),
        })
        .updateEntity(true)
        .execute();
    }
  }

  async updateTimeToken(id: string): Promise<void> {
    const { amount, unit } = this.parseExpirationJwt(envs.jwtExpiration);
    const token: MntTokens = await this.tokensRepository.preload({
      id,
      expirationTime: moment()
        .tz('America/El_Salvador')
        .add(amount, unit)
        .format(),
      updateAt: moment().tz('America/El_Salvador').format(),
    });

    await this.tokensRepository.save(token);
  }

  parseExpirationJwt(jwtExpireTime: any) {
    const regex = /^(\d+)([a-zA-Z]+)$/;
    const match = jwtExpireTime.match(regex);
    if (!match) {
      throw new BadRequestException('Format invalid: ' + jwtExpireTime);
    }
    const [, amount, unit] = match;
    return { amount: parseInt(amount, 10), unit };
  }
}
