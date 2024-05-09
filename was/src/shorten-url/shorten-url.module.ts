import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortenUrlController } from './adapter/in/web/shorten-url.controller';
import { CountAdapter } from './adapter/out/persistence/count.adapter';
import {
  CountEntity,
  CountSchema,
} from './adapter/out/persistence/entity/count.entity';
import {
  ShortenUrlEntity,
  ShortenUrlSchema,
} from './adapter/out/persistence/entity/shorten-url.entity';
import { ShortenUrlAdapter } from './adapter/out/persistence/shorten-url.adapter';
import { CreateShortenUrlUseCase } from './application/port/in/create-shorten-url.use-case';
import { GetOriginalUrlUseCase } from './application/port/in/get-original-url.use-case';
import { GetShortenUrlsUseCase } from './application/port/in/get-shorten-urls.use-case';
import { CommandCountPort } from './application/port/out/command-count.port';
import { CommandShortenUrlPort } from './application/port/out/command-shorten-url.port';
import { QueryShortenUrlPort } from './application/port/out/qeury-shorten-url.port';
import { CreateShortenUrlService } from './application/service/create-shorten-url.service';
import { GetOriginalUrlService } from './application/service/get-original-url.service';
import { GetShortenUrlsService } from './application/service/get-shorten-urls.service';

const ports: Provider[] = [
  { provide: CommandCountPort, useClass: CountAdapter },
  {
    provide: CommandShortenUrlPort,
    useClass: ShortenUrlAdapter,
  },
  { provide: QueryShortenUrlPort, useClass: ShortenUrlAdapter },
];

const useCases: Provider[] = [
  { provide: CreateShortenUrlUseCase, useClass: CreateShortenUrlService },
  { provide: GetOriginalUrlUseCase, useClass: GetOriginalUrlService },
  { provide: GetShortenUrlsUseCase, useClass: GetShortenUrlsService },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShortenUrlEntity.name, schema: ShortenUrlSchema },
      { name: CountEntity.name, schema: CountSchema },
    ]),
  ],
  controllers: [ShortenUrlController],
  providers: [...ports, ...useCases],
})
export class ShortenUrlModule {}
