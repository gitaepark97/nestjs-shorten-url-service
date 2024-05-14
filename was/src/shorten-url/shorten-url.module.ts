import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortenUrlController } from './adapter/in/web/shorten-url.controller';
import { ShortenUrlCacheAdapter } from './adapter/out/memory/shorten-url-cache.adapter';
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
import { CreateShortenUrlCachePort } from './application/port/out/create-shorten-url-cache.port';
import { CreateShortenUrlPort } from './application/port/out/create-shorten-url.port';
import { LoadAndUpdateCountPort } from './application/port/out/load-and-update-count.port';
import { LoadShortenUrlCachePort } from './application/port/out/load-shorten-url-cache.port';
import { LoadShortenUrlPort } from './application/port/out/load-shorten-url.port';
import { UpdateShortenUrlPort } from './application/port/out/update-shorten-url.port';
import { CreateShortenUrlService } from './application/service/create-shorten-url.service';
import { GetOriginalUrlService } from './application/service/get-original-url.service';
import { GetShortenUrlsService } from './application/service/get-shorten-urls.service';

const ports: Provider[] = [
  { provide: LoadAndUpdateCountPort, useClass: CountAdapter },
  { provide: LoadShortenUrlPort, useClass: ShortenUrlAdapter },
  {
    provide: CreateShortenUrlPort,
    useClass: ShortenUrlAdapter,
  },
  { provide: UpdateShortenUrlPort, useClass: ShortenUrlAdapter },
  { provide: LoadShortenUrlCachePort, useClass: ShortenUrlCacheAdapter },
  { provide: CreateShortenUrlCachePort, useClass: ShortenUrlCacheAdapter },
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
