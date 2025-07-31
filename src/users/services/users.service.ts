import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  FindManyOptions,
  FindOptionsWhere,
  ILike,
  Repository,
} from 'typeorm';

import * as bcrypt from 'bcrypt';
import * as moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';
import { authenticator } from 'otplib';

import { RestoreAccountService, RolsService } from '@users/services';
import { MntRestoreAccount, MntUsers } from '@users/entities';
import { createUserDTO, paginationUsersDTO, updateUserDTO } from '@users/dtos';
import { ITransformUser } from '@users/interface/transform-user.interface';
import { CambiarPasswordResetDto } from '@auth/dtos';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(MntUsers)
    private readonly usersRepository: Repository<MntUsers>,
    private readonly rolService: RolsService,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(forwardRef(() => RestoreAccountService))
    private readonly restoreAccountService: RestoreAccountService,
  ) {}

  async findAll(params: paginationUsersDTO) {
    const { take, page, pagination, directionOrder, email } = params;

    const findOptions: FindManyOptions<MntUsers> = {};
    const where: FindOptionsWhere<MntUsers> = {};

    if (email) where.email = ILike(`%${email || ''}%`);

    if (pagination) {
      findOptions.take = take;
      findOptions.skip = take * (page - 1);
    }

    if (directionOrder) findOptions.order = { email: directionOrder };

    findOptions.relations = { rol: true };
    findOptions.select = { rol: { id: true, name: true } };
    findOptions.where = where;

    const [users, count] = await this.usersRepository.findAndCount(findOptions);
    return {
      users,
      pagination: {
        limit: pagination ? take : count,
        offset: pagination ? page : 1,
        total: count,
      },
    };
  }

  async findByEmail(email: string): Promise<MntUsers> {
    return await this.usersRepository.findOne({
      where: { email },
      relations: { rol: true },
    });
  }

  async findOne(id: string): Promise<MntUsers> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: {
        rol: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async create(createUserDTO: createUserDTO): Promise<MntUsers> {
    const { idRol, password, email } = createUserDTO;

    await this.rolService.findOne(idRol);

    if (await this.findByEmail(email)) {
      throw new BadRequestException('Email already exists');
    }

    const hashPassword: string = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      id: uuidv4(),
      password: hashPassword,
      email,
      rol: { id: idRol },
      createAt: moment().tz('America/El_Salvador').format(),
    });

    await this.usersRepository.save(user);

    return user;
  }

  async update(id: string, updateUserDTO: updateUserDTO): Promise<MntUsers> {
    const { idRol, email } = updateUserDTO;
    const oldUser = await this.findOne(id);

    if (email) {
      if ((await this.findByEmail(email)) && email !== oldUser.email) {
        throw new BadRequestException('Email already exists');
      }
    }
    await this.rolService.findOne(idRol);
    const user = await this.usersRepository.preload({
      id,
      rol: { id: idRol },
      email,
      updateAt: moment().tz('America/El_Salvador').format(),
    });

    await this.usersRepository.save(user);
    return user;
  }

  async delete(id: string): Promise<{ message: string }> {
    await this.findOne(id);
    await this.usersRepository.softDelete(id);
    return { message: 'User deleted successfully' };
  }

  async changePasswordReset(payload: CambiarPasswordResetDto) {
    const tokenRegister = await this.restoreAccountService.searchToken(
      payload.token,
    );
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hashPassword = await bcrypt.hash(payload.password, 10);
      const user = await queryRunner.manager.update(
        MntUsers,
        {
          id: tokenRegister.usuarioId,
        },
        {
          password: hashPassword,
        },
      );
      await queryRunner.manager.update(
        MntRestoreAccount,
        {
          id: tokenRegister.recuperacion_cuenta_id,
        },
        {
          active: false,
        },
      );
      await queryRunner.commitTransaction();
      return user;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new NotFoundException('Error al cambiar la contraseña.' + err);
    } finally {
      await queryRunner.release();
    }
  }

  parseUserForLogin(user: MntUsers): ITransformUser {
    const { id, email, rol } = user;
    return {
      id,
      email,
      rol: {
        id: rol?.id,
        name: rol?.name,
      },
    };
  }

  async generateRandomPassword() {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';

    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }

    return password;
  }

  // este metodo restablece la contraseña de un usuario generada aleatoriamente
  async RestorePasswordForAdmin(idUser: string) {
    await this.findOne(idUser);
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const password = await this.generateRandomPassword();
      const hashPassword = await bcrypt.hash(password, 10);
      await queryRunner.manager.update(
        MntUsers,
        {
          id: idUser,
        },
        {
          password: hashPassword,
        },
      );
      await queryRunner.commitTransaction();
      return password;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error);
    } finally {
      await queryRunner.release();
    }
  }

  async setTwoFactorAuthenticationSecret(
    id: string,
    secret: string,
  ): Promise<void> {
    await this.findOne(id);
    const update = await this.usersRepository.preload({
      id,
      twoFactorAuthentionSecret: secret,
    });
    await this.usersRepository.save(update);
  }

  async isTwoFactorAuthenticationCodeValid(
    twoFactorAuthenticationCode: string,
    user: MntUsers,
  ): Promise<boolean> {
    try {
      return authenticator.verify({
        token: twoFactorAuthenticationCode,
        secret: user.twoFactorAuthentionSecret,
      });
    } catch (error) {
      throw new BadRequestException('Error al validar el código');
    }
  }
}
