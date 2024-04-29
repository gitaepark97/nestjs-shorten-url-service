import { Module } from '@nestjs/common';
import { ConfigType, ConfigModule as NestConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { databaseConfig } from './database.config';
import { validate } from './env.validation';
import { serverConfig } from './server.config';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: `${__dirname}/env/.env.${process.env.NODE_ENV}`,
      validate: validate,
      load: [serverConfig, databaseConfig],
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (config: ConfigType<typeof databaseConfig>) => config,
    }),
  ],
})
export class ConfigModule {}
