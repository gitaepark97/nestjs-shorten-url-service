import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import config from './config';
import { validate } from './env.validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: `${__dirname}/env/.env.${process.env.NODE_ENV}`,
      validate: validate,
      load: [config],
      isGlobal: true,
    }),
  ],
})
export class ConfigModule {}
