import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GetCountService } from 'src/counter/application/service/get-count.service';
import { CounterModule } from 'src/counter/counter.module';
import { ShortenUrlController } from './adapter/in/web/shorten-url.controller';
import { CommandShortenUrlAdapter } from './adapter/out/persistence/command-shorten-url.adapter';
import {
  ShortenUrlEntity,
  ShortenUrlSchema,
} from './adapter/out/persistence/shorten-url.entity';
import { CreateShortenUrlUseCase } from './application/port/in/create-shorten-url.use-case';
import { CommandShortenUrlPort } from './application/port/out/command-shorten-url.port';
import { GetCountPort } from './application/port/out/get-count.port';
import { CreateShortenUrlService } from './application/service/create-shorten-url.service';

const ports = [
  { provide: GetCountPort, useClass: GetCountService },
  {
    provide: CommandShortenUrlPort,
    useClass: CommandShortenUrlAdapter,
  },
];

const useCases = [
  { provide: CreateShortenUrlUseCase, useClass: CreateShortenUrlService },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShortenUrlEntity.name, schema: ShortenUrlSchema },
    ]),
    CounterModule,
  ],
  controllers: [ShortenUrlController],
  providers: [...ports, ...useCases],
})
export class ShortenUrlModule {}
