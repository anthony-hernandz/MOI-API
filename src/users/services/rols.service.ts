import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, FindOptionsWhere, ILike, Repository } from 'typeorm';

import { MntRolUser } from '@users/entities';
import { paginationRolsDTO } from '@users/dtos';

@Injectable()
export class RolsService {
  constructor(
    @InjectRepository(MntRolUser)
    private readonly rolRepository: Repository<MntRolUser>,
  ) {}

  async findAll(params: paginationRolsDTO) {
    const { take, page, pagination, directionOrder, name } = params;

    const findOptions: FindManyOptions<MntRolUser> = {};
    const where: FindOptionsWhere<MntRolUser> = {};

    if (name) where.name = ILike(`%${name || ''}%`);

    if (pagination) {
      findOptions.take = take;
      findOptions.skip = take * (page - 1);
    }

    if (directionOrder) findOptions.order = { name: directionOrder };

    findOptions.where = where;

    const [rols, count] = await this.rolRepository.findAndCount(findOptions);
    return {
      rols,
      pagination: {
        limit: pagination ? take : count,
        offset: pagination ? page : 1,
        total: count,
      },
    };
  }

  async findOne(id: string): Promise<MntRolUser> {
    const rol: MntRolUser = await this.rolRepository.findOne({ where: { id } });
    if (!rol) {
      throw new NotFoundException('Rol not found');
    }
    return rol;
  }
}
