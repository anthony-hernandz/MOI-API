import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as moment from 'moment';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { DataSource, QueryRunner, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { envs } from '@config/envs';

import { MntRestoreAccount, MntUsers } from '@users/entities';
import { UsersService } from './users.service';

@Injectable()
export class RestoreAccountService {
  constructor(
    @InjectRepository(MntRestoreAccount)
    private readonly _restoreAccoutRepository: Repository<MntRestoreAccount>,
    @InjectDataSource()
    private dataSource: DataSource,
    @Inject(forwardRef(() => UsersService))
    private readonly _usersService: UsersService,
  ) {}

  async create(
    usuario: MntUsers,
    ip: string,
    route: string,
    useQueryRunner?: QueryRunner,
  ) {
    const max_attemps = envs.maxAttempsRecoverPasswordEmail;
    const max_seconds = envs.mailRecoverPasswordTimeSeconds;
    const urlApplication = envs.baseUrlApplicationFront;
    const dateTime = new Date().getTime();
    const fechaHoraExpiracion = dateTime + parseInt(max_seconds) * 1000;
    const expirationDateTime = moment(fechaHoraExpiracion)
      .tz('America/El_Salvador')
      .format('DD/MM/YYYY HH:mm:ss');
    const fechaHoraActual = moment(dateTime)
      .tz('America/El_Salvador')
      .format('DD/MM/YYYY HH:mm:ss');

    const saltOrRounds = 10;
    const password = fechaHoraActual + `${usuario.id}`;
    const token = await bcrypt.hash(password, saltOrRounds);
    const tokenNew = token.split('/').join('');
    const tokenNew2 = tokenNew.split('.').join('');
    const tokenNew3 = tokenNew2.split('$').join('');
    const linkRecuperacion = `${urlApplication}${route}${tokenNew3}`;
    const attemps = await this._restoreAccoutRepository
      .createQueryBuilder('recuperacion_cuenta')
      .select(['recuperacion_cuenta.id'])
      .where('recuperacion_cuenta.id_user = :usuarioId', {
        usuarioId: usuario.id,
      })
      .andWhere('recuperacion_cuenta.active is true')
      .andWhere(
        'recuperacion_cuenta.dataTimeExpiration >= :fechaHoraExpiracion',
        {
          fechaHoraExpiracion: fechaHoraActual,
        },
      )
      .getCount();
    if (attemps < parseInt(max_attemps)) {
      let queryRunner: QueryRunner = useQueryRunner;
      if (!useQueryRunner) {
        queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
      }
      let ipAddress: string = ip || '';
      if (ipAddress.substr(0, 7) == '::ffff:') {
        ipAddress = ipAddress.substr(7);
      }
      try {
        await queryRunner.manager.insert(MntRestoreAccount, [
          {
            id: uuidv4(),
            ip: ipAddress,
            linkRestore: linkRecuperacion,
            tokenRestore: tokenNew3,
            active: true,
            user: usuario,
            dataTimeExpiration: expirationDateTime,
          },
        ]);

        if (!useQueryRunner) {
          await queryRunner.commitTransaction();
        }
        return linkRecuperacion;
      } catch (err) {
        if (!useQueryRunner) {
          await queryRunner.rollbackTransaction();
        }
        throw new ConflictException('Error al enviar el email');
      } finally {
        if (!useQueryRunner) {
          await queryRunner.release();
        }
      }
    } else {
      throw new BadRequestException(
        `No se pueden enviar mas de ${max_attemps} peticiones de restablecimiento de password. Intente mas tarde.`,
      );
    }
  }

  async searchToken(token: string) {
    const dateTime = new Date().getTime();
    const fechaHoraActual =
      String(new Date(dateTime).toLocaleDateString()) +
      ' ' +
      String(new Date(dateTime).toLocaleTimeString());
    const attemps = await this._restoreAccoutRepository
      .createQueryBuilder('recuperacion_cuenta')
      .select([
        'recuperacion_cuenta.id',
        'recuperacion_cuenta.dataTimeExpiration',
        'recuperacion_cuenta.active',
        'usuarios.id',
        'usuarios.email',
      ])
      .innerJoin('recuperacion_cuenta.user', 'usuarios')
      .where('recuperacion_cuenta.tokenRestore = :token', {
        token: token,
      })
      .andWhere('recuperacion_cuenta.active is true')
      .andWhere(
        'recuperacion_cuenta.dataTimeExpiration >= :fechaHoraExpiracion',
        { fechaHoraExpiracion: fechaHoraActual },
      )
      .getRawOne();
    if (attemps) {
      return attemps;
    } else {
      throw new NotFoundException(
        `No se encontró una petición de recuperación de cuenta con esa URL`,
      );
    }
  }

  async searchTokenByUser(email: string) {
    const user = await this._usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException(
        `No se encontró un usuario con el email ${email}`,
      );
    }

    const dateTime = new Date().getTime();
    const fechaHoraActual =
      String(new Date(dateTime).toLocaleDateString()) +
      ' ' +
      String(new Date(dateTime).toLocaleTimeString());
    const attemps = await this._restoreAccoutRepository
      .createQueryBuilder('recuperacion_cuenta')
      .select([
        'recuperacion_cuenta.id',
        'recuperacion_cuenta.dataTimeExpiration',
        'recuperacion_cuenta.tokenRestore',
      ])
      .innerJoin('recuperacion_cuenta.user', 'usuarios')
      .where('usuarios.id = :idUser', {
        idUser: user.id,
      })
      .andWhere('recuperacion_cuenta.active is true')
      .andWhere(
        'recuperacion_cuenta.dataTimeExpiration >= :fechaHoraExpiracion',
        { fechaHoraExpiracion: fechaHoraActual },
      )
      .getRawOne();
    if (attemps) {
      return attemps;
    } else {
      throw new NotFoundException(
        `Petición de recuperación invalida, por favor contacte con un administrador del sistema`,
      );
    }
  }
}
