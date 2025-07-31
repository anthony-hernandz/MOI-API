import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Brackets,
  DataSource,
  FindManyOptions,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import * as moment from 'moment-timezone';
import { v4 as uuidv4 } from 'uuid';

import { MntModules } from '../entities';
import { CreateModuleDTO } from '@modules/dtos';
import { TreeBuilderService } from './tree-builder-service.service';
import { sessionUser } from '@common/class/userSession.class';
import { UpdateModuloDto } from '@modules/dtos/update-modulo.dto';
import { ModulosPaginationDto } from '@modules/dtos/modulos-pagination.dto';
import { UsersService } from '@users/services';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(MntModules)
    private readonly moduleRepository: Repository<MntModules>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly treeBuilderService: TreeBuilderService,
    private readonly _sessionUser: sessionUser,
    private readonly userService: UsersService,
  ) {}

  async findAll(params: ModulosPaginationDto) {
    const { page, pagination, take, directionOrder } = params;

    const findOptions: FindManyOptions<MntModules> = {};

    if (pagination) {
      findOptions.skip = take * (page - 1);
      findOptions.take = take;
    }

    if (directionOrder) findOptions.order = { name: directionOrder };

    findOptions.relations = {
      children: false,
      parent: false,
      permissionsModules: false,
    };

    const [modules, total] =
      await this.moduleRepository.findAndCount(findOptions);

    return {
      modules,
      pagination: {
        limit: pagination ? take : total,
        offset: pagination ? page : 1,
        total: total,
      },
    };
  }

  async findById(id: string): Promise<MntModules> {
    const module = await this.moduleRepository.findOne({ where: { id } });

    if (!module) {
      throw new NotFoundException(`Module not found`);
    }
    return module;
  }

  async create(module: CreateModuleDTO): Promise<MntModules> {
    const { parentId, ...data } = module;

    if (parentId) {
      await this.findById(parentId);
    }
    const newModule = this.moduleRepository.create({
      id: uuidv4(),
      ...data,
      active: true,
      parent: { id: parentId || null },
      createAt: moment().tz('America/El_Salvador').format(),
    });
    return await this.moduleRepository.save(newModule);
  }

  async update(id: string, module: UpdateModuloDto): Promise<MntModules> {
    await this.findById(id);
    const updateModule = await this.moduleRepository.preload({
      id,
      ...module,
      updateAt: moment().tz('America/El_Salvador').format(),
    });
    return await this.moduleRepository.save(updateModule);
  }

  /**
   * @description Metodo que obtiene el menu (modulos) al cual es usuario tiene permisos
   * @returns
   */
  async getMenuByUser(): Promise<MntModules[]> {
    const user = await this.userService.findOne(this._sessionUser.idUser);

    try {
      let menu: MntModules[] = [];

      menu = await this.dataSource
        .getRepository(MntModules)
        .createQueryBuilder('etiquetas')
        .select([
          'etiquetas.id',
          'etiquetas.name',
          'etiquetas.icon',
          'etiquetas.ruteUi',
          'etiquetas.id_parent',
          'etiquetas.type',
        ])
        .where('etiquetas.active = TRUE')
        .andWhere('etiquetas.visible = TRUE')
        .andWhere('etiquetas.type = 0')
        .orderBy('etiquetas.priority', 'ASC')
        .getMany();

      for (const etiqueta of menu) {
        etiqueta.children = await this.dataSource
          .getRepository(MntModules)
          .createQueryBuilder('children')
          .select([
            'children.id',
            'children.name',
            'children.icon',
            'children.ruteUi',
            'children.id_parent',
            'children.type',
          ])
          .where('children.active = TRUE')
          .andWhere('children.visible = TRUE')
          .andWhere('children.type IN (:...types)', { types: [1] })
          .andWhere('children.id_parent = :id', { id: etiqueta.id })
          .andWhere(
            new Brackets((condition) => {
              condition
                .where((qb) => {
                  const subQuery = qb
                    .subQuery()
                    .select('parent.id')
                    .from(MntModules, 'menu')
                    .innerJoin('menu.parent', 'parent')
                    .innerJoin('menu.permissionsModules', 'permissionsModules')
                    .innerJoin('permissionsModules.permission', 'permissions')
                    .innerJoin('permissions.permissionsUser', 'permissionsUser')
                    .innerJoin('permissionsUser.user', 'user')
                    .where('user.id = :userId')
                    .andWhere('permissionsUser.typePermission = 1')
                    .andWhere('menu.active = TRUE')
                    .andWhere('menu.visible = TRUE')
                    .andWhere('menu.type = 2')
                    .getQuery();
                  return `children.id IN (${subQuery})`;
                })
                .orWhere((qb2) => {
                  const subQuery2 = qb2
                    .subQuery()
                    .select('parent.id')
                    .from(MntModules, 'module')
                    .innerJoin('module.parent', 'parent')
                    .innerJoin(
                      'module.permissionsModules',
                      'permissionsModules',
                    )
                    .innerJoin('permissionsModules.permission', 'permissions')
                    .innerJoin('permissions.permissionsRol', 'permissionsRol')
                    .innerJoin('permissionsRol.rol', 'rol')
                    .where('rol.id = :roleId')
                    .andWhere('module.active = TRUE')
                    .andWhere('module.visible = TRUE')
                    .andWhere('module.type = 2')
                    .getQuery();
                  return `children.id IN (${subQuery2})`;
                });
            }),
          )
          .setParameter('userId', user.id)
          .setParameter('roleId', user?.rol.id)
          .getMany();
      }

      return menu;
    } catch (error) {
      throw new NotFoundException(
        `Modules not found or an error occurred ${error.message}`,
      );
    }
  }

  /**
   * @description Metodo se utiliza para generar acceso a los modulos por rol o usuario
   * @param filter: objeto que recibe el rol y/o el usuario (ambos para obtener por usuario)
   * @returns arbol de los modulon sus hijos
   */
  async findModules(filter: {
    idRol?: string | null;
    idUser?: string | null;
  }): Promise<MntModules[]> {
    const { idRol, idUser } = filter || {};

    if (idUser && !idRol) throw new BadRequestException('Id Rol is required');

    const repository: SelectQueryBuilder<MntModules> = this.dataSource
      .getRepository(MntModules)
      .createQueryBuilder('modules')
      .leftJoin('modules.permissionsModules', 'permissionsModules')
      .leftJoin('permissionsModules.permission', 'permissions')
      .select([
        'modules.id',
        'modules.name',
        'modules.icon',
        'modules.ruteUi',
        'modules.id_parent',
        'modules.type',
        'modules.priority',
        'permissionsModules',
      ])
      .where('modules.active = TRUE')
      .andWhere('modules.visible = TRUE');

    if (idRol) {
      repository
        .leftJoin('permissions.permissionsRol', 'permissionsRol')
        .leftJoin('permissionsRol.rol', 'rol', 'rol.id = :idRol', { idRol })
        .addSelect(['permissions.id', 'permissionsRol.id']);
    }

    if (idUser) {
      repository
        .leftJoin('permissions.permissionsUser', 'permissionsUser')
        .leftJoin('permissionsUser.user', 'user', 'user.id = :idUser', {
          idUser,
        })
        .addSelect(['permissionsUser.id', 'permissionsUser.typePermission']);
    }

    const modules = await repository
      .orderBy('modules.type', 'ASC')
      .addOrderBy('modules.priority', 'ASC')
      .getMany();

    if (modules.length === 0) {
      throw new NotFoundException('No active modules found');
    }

    return this.treeBuilderService.buildSafeTree(modules);
  }
}
