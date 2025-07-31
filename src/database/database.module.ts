import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostgresDatabaseProvider } from './providers/postgres.providers';

@Global()
@Module({
  imports: [PostgresDatabaseProvider],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
