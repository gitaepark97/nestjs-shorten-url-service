import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GetCountService } from 'src/counter/application/service/get-count.service';
import { CounterModule } from 'src/counter/counter.module';
import { ShortenUrlController } from './adapter/in/web/shorten-url.controller';
import { CommandShortenUrlAdapter } from './adapter/out/persistence/command-shorten-url.adapter';
import { QueryShortenUrlAdapter } from './adapter/out/persistence/query-shorten-url.adapter';
import {
  ShortenUrlEntity,
  ShortenUrlSchema,
} from './adapter/out/persistence/shorten-url.entity';
import { CreateShortenUrlUseCase } from './application/port/in/create-shorten-url.use-case';
import { GetOriginalUrlUseCase } from './application/port/in/get-original-url.use-case';
import { CommandShortenUrlPort } from './application/port/out/command-shorten-url.port';
import { GetCountPort } from './application/port/out/get-count.port';
import { QueryShortenUrlPort } from './application/port/out/query-shorten-url.port';
import { CreateShortenUrlService } from './application/service/create-shorten-url.service';
import { GetOriginalUrlService } from './application/service/get-original-url.service';

const ports = [
  { provide: GetCountPort, useClass: GetCountService },
  {
    provide: CommandShortenUrlPort,
    useClass: CommandShortenUrlAdapter,
  },
  { provide: QueryShortenUrlPort, useClass: QueryShortenUrlAdapter },
];

const useCases = [
  { provide: CreateShortenUrlUseCase, useClass: CreateShortenUrlService },
  { provide: GetOriginalUrlUseCase, useClass: GetOriginalUrlService },
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
