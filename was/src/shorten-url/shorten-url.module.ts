import { BullModule } from '@nestjs/bull';
import { Logger, Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ShortenUrlController } from './adapter/in/web/shorten-url.controller';
import { ShortenUrlCacheRepositoryImpl } from './adapter/out/memory/shorten-url-cache.adapter';
import { ShortenUrlConsumer } from './adapter/out/mq/shorten-url.consumer';
import { ShortenUrlProducer } from './adapter/out/mq/shorten-url.producer';
import { CountRepositoryImpl } from './adapter/out/persistence/count.repository';
import {
  CountEntity,
  CountSchema,
} from './adapter/out/persistence/entity/count.entity';
import {
  ShortenUrlEntity,
  ShortenUrlSchema,
} from './adapter/out/persistence/entity/shorten-url.entity';
import {
  ShortenUrlRepository,
  ShortenUrlRepositoryImpl,
} from './adapter/out/persistence/shorten-url.repository';
import { CreateShortenUrlUseCase } from './application/port/in/create-shorten-url.use-case';
import { GetOriginalUrlUseCase } from './application/port/in/get-original-url.use-case';
import { GetShortenUrlsUseCase } from './application/port/in/get-shorten-urls.use-case';
import { CreateShortenUrlCachePort } from './application/port/out/create-shorten-url-cache.port';
import { CreateShortenUrlPort } from './application/port/out/create-shorten-url.port';
import { LoadAndUpdateCountPort } from './application/port/out/load-and-update-count.port';
import { LoadShortenUrlCachePort } from './application/port/out/load-shorten-url-cache.port';
import { LoadShortenUrlPort } from './application/port/out/load-shorten-url.port';
import { UpdateShortenUrlPort } from './application/port/out/update-shorten-url.port';
import {
  CountService,
  CountServiceImpl,
} from './application/service/count.service';
import { CreateShortenUrlServiceImpl } from './application/service/create-shorten-url.service';
import { GetOriginalUrlServiceImpl } from './application/service/get-original-url.service';
import { GetShortenUrlsServiceImpl } from './application/service/get-shorten-urls.service';

const repositories: Provider[] = [
  { provide: ShortenUrlRepository, useClass: ShortenUrlRepositoryImpl },
];

const services: Provider[] = [
  { provide: CountService, useClass: CountServiceImpl },
];

const ports: Provider[] = [
  { provide: LoadAndUpdateCountPort, useClass: CountRepositoryImpl },
  { provide: LoadShortenUrlPort, useClass: ShortenUrlRepositoryImpl },
  {
    provide: CreateShortenUrlPort,
    useClass: ShortenUrlRepositoryImpl,
  },
  { provide: UpdateShortenUrlPort, useClass: ShortenUrlProducer },
  { provide: LoadShortenUrlCachePort, useClass: ShortenUrlCacheRepositoryImpl },
  {
    provide: CreateShortenUrlCachePort,
    useClass: ShortenUrlCacheRepositoryImpl,
  },
];

const useCases: Provider[] = [
  { provide: CreateShortenUrlUseCase, useClass: CreateShortenUrlServiceImpl },
  { provide: GetOriginalUrlUseCase, useClass: GetOriginalUrlServiceImpl },
  { provide: GetShortenUrlsUseCase, useClass: GetShortenUrlsServiceImpl },
];

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ShortenUrlEntity.name, schema: ShortenUrlSchema },
      { name: CountEntity.name, schema: CountSchema },
    ]),
    BullModule.registerQueue({ name: 'shortenUrlQueue' }),
    BullModule.registerQueue({ name: 'deadLetterQueue' }),
  ],
  controllers: [ShortenUrlController],
  providers: [
    ...repositories,
    ...services,
    ...ports,
    ...useCases,
    ShortenUrlConsumer,
    Logger,
  ],
})
export class ShortenUrlModule {}
