import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Repository } from 'typeorm';

import * as moment from 'moment-timezone';
import { v4 as uuid } from 'uuid';

import { IScopes } from '@auth/interfaces';
import {
  CreatePermissionDTO,
  SavePermissionsModule,
  SavePermissionsRolDTO,
  SavePermissionsUserDTO,
} from '@modules/dtos';
import {
  MntModules,
  MntPermissionModules,
  MntPermissions,
  MntPermissionsRol,
  MntPermissionsUser,
} from '@modules/entities';
import { TypePermissionEnum } from '@modules/enums/type-permission.enum';
import { ModulesService } from '@modules/services';
import { MntUsers } from '@users/entities';
import { RolsService, UsersService } from '@users/services';
import { UpdatePermisssionDto } from '@modules/dtos/update-permission.dto';
import { PermissionsPaginateDto } from '@modules/dtos/permissions-paginate.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(MntPermissions)
    private readonly _permissionsRepository: Repository<MntPermissions>,
    @InjectRepository(MntPermissionsRol)
    private readonly _permissionsRolRepository: Repository<MntPermissionsRol>,
    @InjectRepository(MntPermissionsUser)
    private readonly _permissionsUserRepository: Repository<MntPermissionsUser>,
    @InjectRepository(MntPermissionModules)
    private readonly _permissionsModulesRepository: Repository<MntPermissionModules>,
    private readonly moduleService: ModulesService,
    private readonly rolService: RolsService,
    private readonly usersService: UsersService,
  ) {}

  async findAllPermissions(params: PermissionsPaginateDto) {
    const { page, pagination, take, directionOrder } = params;

    const findOptions: FindManyOptions<MntPermissions> = {};

    if (pagination) {
      findOptions.skip = take * (page - 1);
      findOptions.take = take;
    }

    if (directionOrder) findOptions.order = { name: directionOrder };

    findOptions.relations = {
      permissionsRol: false,
      permissionsUser: false,
      permissionsModules: false,
    };

    const [permissions, total] =
      await this._permissionsRepository.findAndCount(findOptions);

    return {
      permissions,
      pagination: {
        limit: pagination ? take : total,
        offset: pagination ? page : 1,
        total: total,
      },
    };
  }

  async findById(id: string): Promise<MntPermissions> {
    const permission = await this._permissionsRepository.findOne({
      where: { id },
    });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async createPermission(
    permission: CreatePermissionDTO,
  ): Promise<MntPermissions> {
    const newPermission = this._permissionsRepository.create({
      id: uuid(),
      ...permission,
      active: true,
      createAt: moment().tz('America/El_Salvador').format(),
    });
    return await this._permissionsRepository.save(newPermission);
  }

  async updatePermission(
    id: string,
    permission: UpdatePermisssionDto,
  ): Promise<MntPermissions> {
    await this.findById(id);
    const updatedPermission = await this._permissionsRepository.preload({
      id,
      ...permission,
      updateAt: moment().tz('America/El_Salvador').format(),
    });
    return await this._permissionsRepository.save(updatedPermission);
  }

  /**
   * @description: este metodo se utiliza para asignar los permisos (acceso a los modulos) de un rol
   * @param permissions
   */
  async savePermissionsRol(permissions: SavePermissionsRolDTO) {
    const { idRol, modules } = permissions;
    await this.rolService.findOne(idRol);

    const permissionsByModules: MntPermissionModules[] =
      await this.getPermissionsByModule(modules);

    if (permissionsByModules?.length < 1) {
      throw new BadRequestException(
        'No permissions found for the provided modules',
      );
    }
    const permissionsByModulesIds: string[] = permissionsByModules.map(
      ({ permission }): string => permission.id,
    );

    //get permissions by rol
    const permissionByRol = await this.getPermissionsByRol(idRol);
    const permissionsByRolIds: string[] = permissionByRol.map(
      (p): string => p?.permission.id,
    );
    const { onlyInNews, onlyInOlds } = this.getDifferencePermissions(
      permissionsByModulesIds,
      permissionsByRolIds,
    );

    // eliminar permisos anteriores
    await this._permissionsRolRepository.delete({
      permission: { id: In(onlyInOlds) },
    });

    //  asociamos los permisos al rol en memorias
    const permissionsToAssociate: MntPermissionsRol[] = onlyInNews.map(
      (permission) => {
        return this._permissionsRolRepository.create({
          id: uuid(),
          permission: { id: permission },
          rol: { id: idRol },
          createAt: moment().tz('America/El_Salvador').format(),
        });
      },
    );

    // guardamos los permisos asociados al rol en DB
    await this._permissionsRolRepository.save(permissionsToAssociate);
    return { message: 'Permissions associated successfully' };
  }

  /**
   * @description: este metodo se utiliza para asignar y declinar permisos especiales a un usuario
   * @param permissions
   */
  async savePermissionsUser(permissions: SavePermissionsUserDTO) {
    const { idUser, modules } = permissions;
    // obtenemos el rol del usuario
    const user = await this.usersService.findOne(idUser);

    // obtener los permisos asociados a los modulos
    const permissionsByModules: MntPermissionModules[] =
      await this.getPermissionsByModule(modules);

    if (permissionsByModules?.length < 1) {
      throw new BadRequestException(
        'No permissions found for the provided modules',
      );
    }

    const idsPermissionsByModules: string[] =
      permissionsByModules?.map(({ permission }): string => permission.id) ||
      [];

    const permissionsByRol: MntPermissionsRol[] =
      await this.getPermissionsByRol(user?.rol.id);

    const idsPermissionsByRol: string[] =
      permissionsByRol?.map(({ permission }): string => permission.id) || [];

    // TODO: el resultado en comparando los permisos enviados con los existentes en el rol del usuario
    // Más adelante se valida si ya tenia anteriormente permisos especiales
    /**
     * permissionsToAssign = nuevos permisos que se deben asignar al usuario
     * permissionsToDecline = permisos que se deben declinar al usuario
     */
    const {
      onlyInNews: permissionsToAssign,
      onlyInOlds: permissionsToDecline,
    } = this.getDifferencePermissions(
      idsPermissionsByModules,
      idsPermissionsByRol,
    );

    // buscamos cuantos de estos permisos ya existen en MntPermissionsUser para evitar duplicados
    const specialsPermissions = await this.getPermissionsByUser(user.id);
    if (specialsPermissions?.length > 0) {
      // eliminados permisos especiales anteriores, ya que los nuevos se procesan acontinuación
      await this._permissionsUserRepository.delete({
        user: { id: idUser },
      });
    }

    let permissionsAssignedForAssociate: MntPermissionsUser[] = [];
    let permissionsDeclinedForAssociate: MntPermissionsUser[] = [];

    // permisos especiales del usuario
    if (permissionsToAssign?.length > 0) {
      permissionsAssignedForAssociate = permissionsToAssign.map(
        (permission) => {
          return this.assignOrDeclinePermissionsToUser(
            idUser,
            permission,
            TypePermissionEnum.Assigned,
          );
        },
      );
    }

    if (permissionsToDecline?.length > 0) {
      permissionsDeclinedForAssociate = permissionsToDecline.map(
        (permissions) => {
          return this.assignOrDeclinePermissionsToUser(
            idUser,
            permissions,
            TypePermissionEnum.Declined,
          );
        },
      );
    }

    const permissionsForToSave: MntPermissionsUser[] =
      permissionsAssignedForAssociate.concat(permissionsDeclinedForAssociate);

    // guardamos los permisos especiales en DB
    await this._permissionsUserRepository.save(permissionsForToSave);
    return { message: 'Permissions associated successfully' };
  }

  /**
   * @description: este metodo se utiliza para obtener los permisos de un rol
   * @param rol
   * @returns: retorna los permisos del rol
   */
  async getPermissionsByRol(rol: string): Promise<MntPermissionsRol[]> {
    const permissions = await this._permissionsRolRepository.find({
      where: { rol: { id: rol } },
      relations: { rol: true, permission: true },
    });
    permissions.map((p) => {
      const { permission } = p;
      return {
        id: permission.id,
        name: permission.name,
      };
    });
    return permissions;
  }

  /**
   * @description: este metodo se utiliza para obtener los permisos especiales de un usuario
   * @param user
   * @returns: retorna los permisos del usuario
   */
  async getPermissionsByUser(user: string): Promise<MntPermissionsUser[]> {
    const permissions = await this._permissionsUserRepository.find({
      where: { user: { id: user } },
      relations: { user: true, permission: true },
    });
    return permissions.map((permission: MntPermissionsUser) => permission);
  }

  /**
   *
   * @param user
   * @returns Array de los Permissions activos del usuario (Rol, permisos especiales asignados)
   */
  async getAllPermissionsActivesByUser(
    user: MntUsers,
  ): Promise<MntPermissions[]> {
    const permissionsByRol: MntPermissionsRol[] =
      await this.getPermissionsByRol(user.rol.id);
    const permissionsByUser: MntPermissionsUser[] =
      await this.getPermissionsByUser(user.id);

    const idsPermissionsUserDeclined: string[] =
      this.getPermissionsDeclinedByUser(permissionsByUser).map(
        (permissionDeclined): string => permissionDeclined.permission.id,
      );

    const permissionsUserAssigned: MntPermissionsUser[] =
      this.getPermissionsAssignedByUser(permissionsByUser);

    const permisionsRolWithoutDeclined: MntPermissionsRol[] =
      permissionsByRol.filter(
        ({ permission }): boolean =>
          !idsPermissionsUserDeclined.includes(permission.id),
      );
    const allPermissions: MntPermissions[] = permisionsRolWithoutDeclined
      .map(({ permission }): MntPermissions => permission)
      .concat(
        permissionsUserAssigned.map(
          ({ permission }): MntPermissions => permission,
        ),
      );

    const uniquesPermissions = new Map<string, MntPermissions>();
    // eliminamos permisos duplicados
    for (const uniquePermission of allPermissions) {
      uniquesPermissions.set(uniquePermission.id, uniquePermission); // si hay duplicados, los sobrescribe
    }

    return Array.from(uniquesPermissions.values());
  }

  async getPermissionsForScope(user: MntUsers): Promise<IScopes[]> {
    const permissionsActives = await this.getAllPermissionsActivesByUser(user);
    return permissionsActives.map((permission: MntPermissions) => {
      return {
        id: permission.id,
        name: permission.name,
        endpoint: permission.endpoint,
        method: permission.method,
      };
    });
  }

  /**
   * @description: este metodo se utiliza para asociar permisos a un modulo
   * @param permissions
   * @returns: retorna los permisos asociados al modulo
   */
  async asociatePermissions(permissions: SavePermissionsModule) {
    const { idModule, permissions: permissionsToSave } = permissions;

    await this.moduleService.findById(idModule);

    const permissionsToAssociate = permissionsToSave.map(
      (permission: string) => {
        return {
          permission: { id: permission },
          module: { id: idModule },
        };
      },
    );

    return await this._permissionsModulesRepository.save(
      permissionsToAssociate,
    );
  }

  /**
   * @description: este metodo se utiliza configurar los permisos de los modulos al rol
   * @param idRol
   * @returns: retorna los todos modulos con sus permisos asociados
   */
  async getPermissionsActivesByRol(idRol: string) {
    const rol = await this.rolService.findOne(idRol);
    const modules = await this.moduleService.findModules({ idRol });
    const permissions = this.threeModulesPermissionsByRol(modules);
    return {
      rol: rol.name,
      permissions,
    };
  }

  /**
   * @description: este metodo se utiliza configurar los permisos de los modulos al usuario
   * @param idUser
   * @returns: retorna los todos modulos con sus permisos asociados
   */
  async getPermissionsActivesByUser(idUser: string) {
    const user = await this.usersService.findOne(idUser);
    const permissionsActives = await this.getAllPermissionsActivesByUser(user);
    const modules = await this.moduleService.findModules({
      idRol: user?.rol?.id,
      idUser,
    });
    const permissions = this.threeModulesPermissionsByUser(
      modules,
      permissionsActives,
    );
    return {
      user: user.email,
      permissions,
    };
  }

  /**
   * @description: este metodo se utiliza para obtener los modulos y sus hijos
   * @param modules
   * @returns: retorna todos los modulos con sus permisos asociados (haspermission)
   */
  threeModulesPermissionsByRol(modules: MntModules[]) {
    return modules.map((module: MntModules) => {
      const { permissionsModules, children, ...moduleData } = module;
      return {
        ...moduleData,
        hasPermission:
          permissionsModules?.length > 0 &&
          permissionsModules.some(
            ({ permission }): boolean => permission?.permissionsRol?.length > 0,
          ),
        children: this.threeModulesPermissionsByRol(children),
      };
    });
  }

  /**
   * @description: este metodo se utiliza para obtener los modulos y sus hijos
   * @param modules
   * @returns: retorna todos los modulos con sus permisos asociados (haspermission)
   */
  threeModulesPermissionsByUser(
    modules: MntModules[],
    permissionsActives: MntPermissions[],
  ) {
    // Creamos un Set con los IDs de los permisos activos para mejor rendimiento en las búsquedas
    const activePermissionIds = new Set(
      permissionsActives?.map((p) => p.id) ?? [],
    );
    return modules.map((module: MntModules) => {
      const { permissionsModules, children, ...moduleData } = module;
      return {
        ...moduleData,
        hasPermission:
          permissionsModules?.length > 0 &&
          permissionsModules.some(({ permission }) =>
            activePermissionIds.has(permission.id),
          ),
        children: this.threeModulesPermissionsByUser(
          children,
          permissionsActives,
        ),
      };
    });
  }

  async getPermissionsByModule(
    idsModules: string[],
  ): Promise<MntPermissionModules[]> {
    return await this._permissionsModulesRepository
      .createQueryBuilder('pm')
      .innerJoin('pm.module', 'module')
      .innerJoin('pm.permission', 'permission')
      .where('module.id IN (:...ids)', { ids: idsModules })
      .select(['pm', 'permission'])
      .getMany();
  }

  /**
   * @description: este metodo se utiliza para obtener permisos a ser asociados al rol o usuario y los que deben ser eliminados
   * @param newsPermissions
   * @param oldsPermissions
   * @returns: objeto con dos arrays, uno con los permisos que solo están en newsPermissions y otro con los permisos que solo estan en oldsPermissions
   */
  getDifferencePermissions(
    newsPermissions: string[],
    oldsPermissions: string[],
  ) {
    const setNewsPermissions = new Set(newsPermissions);
    const setOldsPermissions = new Set(oldsPermissions);

    const onlyInNews = new Set<string>();
    const onlyInOlds = new Set<string>();

    for (const permission of setNewsPermissions) {
      if (!setOldsPermissions.has(permission)) {
        onlyInNews.add(permission);
      }
    }

    for (const permission of setOldsPermissions) {
      if (!setNewsPermissions.has(permission)) {
        onlyInOlds.add(permission);
      }
    }
    return {
      onlyInNews: Array.from(onlyInNews),
      onlyInOlds: Array.from(onlyInOlds),
    };
  }

  /**
   *
   * @param permisssions
   * @returns Objeto en memoria de permiso especial a asignar
   */
  getPermissionsDeclinedByUser(
    permisssions: MntPermissionsUser[],
  ): MntPermissionsUser[] {
    return permisssions.filter(
      (permission: MntPermissionsUser): boolean =>
        permission.typePermission === TypePermissionEnum.Declined,
    );
  }

  /**
   *
   * @param permisssions
   * @returns Objeto en memoria de permiso especial a declinar
   */
  getPermissionsAssignedByUser(
    permisssions: MntPermissionsUser[],
  ): MntPermissionsUser[] {
    return permisssions.filter(
      (permission: MntPermissionsUser): boolean =>
        permission.typePermission === TypePermissionEnum.Assigned,
    );
  }

  assignOrDeclinePermissionsToUser(
    idUser: string,
    idPermission: string,
    typePermission: TypePermissionEnum,
  ): MntPermissionsUser {
    return this._permissionsUserRepository.create({
      id: uuid(),
      permission: { id: idPermission },
      user: { id: idUser },
      typePermission,
      createAt: moment().tz('America/El_Salvador').format(),
    });
  }
}
