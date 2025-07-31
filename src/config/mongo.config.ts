// src/config/mongo.config.ts
import { MongooseModuleOptions } from '@nestjs/mongoose';
import { envs } from './envs';

export const mongoConfig = async (): Promise<MongooseModuleOptions> => ({
  uri: envs.mongoUri,
});
