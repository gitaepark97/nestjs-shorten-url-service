import { registerAs } from '@nestjs/config';
import { MongooseModuleFactoryOptions } from '@nestjs/mongoose';

export const databaseConfig = registerAs(
  'database',
  (): MongooseModuleFactoryOptions => ({
    uri: process.env.MONGODB_URI!,
  }),
);
