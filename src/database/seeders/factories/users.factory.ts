import { DataSource, Repository } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';
import { MntUsers } from '@users/entities';
import { UsersSeed } from '../data/users.data';
import * as moment from 'moment-timezone';

export class UsersFactory implements Seeder {
  async run(dataSource: DataSource): Promise<void> {
    const repository: Repository<MntUsers> = dataSource.getRepository(MntUsers);
    for (const dato of UsersSeed) {
      const { password, idRol, ...data } = dato;
      const hashPassword: string = await bcrypt.hash(password, 10);
      const newDato: MntUsers = repository.create({
        password: hashPassword,
        ...data,
        rol: { id: idRol },
        createAt: moment().tz('America/El_Salvador').format(),
      });
      await repository.save(newDato);
    }
  }
}
