import { DataSource, Repository } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { MntRolUser } from '@users/entities';
import { RolsSeed } from '../data/rols.data';
import * as moment from 'moment-timezone';

export class RolsFactory implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repository: Repository<MntRolUser> =
      dataSource.getRepository(MntRolUser);
    for (const dato of RolsSeed) {
      const newDato: MntRolUser = repository.create({
        ...dato,
        createAt: moment().tz('America/El_Salvador').format(),
      });
      await repository.save(newDato);
    }
  }
}
