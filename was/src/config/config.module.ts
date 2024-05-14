import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigType, ConfigModule as NestConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { cacheConfig } from './cache.config';
import { databaseConfig } from './database.config';
import { validate } from './env.validation';
import { serverConfig } from './server.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: `${__dirname}/env/.env.${process.env.NODE_ENV}`,
      validate: validate,
      load: [serverConfig, databaseConfig, cacheConfig],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => config,
    }),
    CacheModule.registerAsync({
      inject: [cacheConfig.KEY],
      useFactory: (config: ConfigType<typeof cacheConfig>) => config,
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}
