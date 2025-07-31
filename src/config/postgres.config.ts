import { DataSource, DataSourceOptions } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { SeederOptions } from 'typeorm-extension';
import { envs } from './envs';
import InitialSeeder from '@database/seeders/initial.seeder';

const optionsConections: TypeOrmModuleOptions &
  DataSourceOptions &
  SeederOptions = {
  type: 'postgres',
  host: envs.postgres.dbHost,
  port: envs.postgres.dbPort,
  username: envs.postgres.dbUser,
  password: envs.postgres.dbPassword,
  database: envs.postgres.dbName,
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  logging: /*envs.nodeEnv === 'development'*/ false,
  synchronize: false,
  migrations: ['src/database/migrations/*.ts'],
  seeds: [InitialSeeder],
};

//required for conecction to db
export const postgresConfig = async (): Promise<TypeOrmModuleOptions> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { migrations, seeds, ...options } = optionsConections;
  return options;
};

// required for generate migrations
export default new DataSource(optionsConections);
