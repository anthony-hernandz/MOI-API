// src/database/postgres.providers.ts
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { postgresConfig } from '@config/postgres.config';

export const PostgresDatabaseProvider = TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: postgresConfig,
});
