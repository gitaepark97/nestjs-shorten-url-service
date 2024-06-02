import { Module, Provider } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { KafkaModule } from 'src/kafka/kafka.module';
import { ShortenUrlController } from './adapter/in/web/shorten-url.controller';
import { ShortenUrlCacheRepositoryImpl } from './adapter/out/memory/shorten-url-cache.adapter';
import { ShortenUrlConsumer } from './adapter/out/mq/shorten-url.consumer';
import { ShortenUrlProducer } from './adapter/out/mq/shorten-url.producer';
import { CountRepositoryImpl } from './adapter/out/persistence/count.repository-impl';
import {
  CountEntity,
  CountSchema,
} from './adapter/out/persistence/entity/count.entity';
import {
  ShortenUrlEntity,
  ShortenUrlSchema,
} from './adapter/out/persistence/entity/shorten-url.entity';
import { ShortenUrlRepository } from './adapter/out/persistence/shorten-url.repository';
import { ShortenUrlRepositoryImpl } from './adapter/out/persistence/shorten-url.repository-impl';
import { CreateShortenUrlUseCase } from './application/port/in/create-shorten-url.use-case';
import { GetOriginalUrlUseCase } from './application/port/in/get-original-url.use-case';
import { GetShortenUrlsUseCase } from './application/port/in/get-shorten-urls.use-case';
import { CreateShortenUrlCachePort } from './application/port/out/create-shorten-url-cache.port';
import { CreateShortenUrlPort } from './application/port/out/create-shorten-url.port';
import { LoadAndUpdateCountPort } from './application/port/out/load-and-update-count.port';
import { LoadShortenUrlCachePort } from './application/port/out/load-shorten-url-cache.port';
import { LoadShortenUrlPort } from './application/port/out/load-shorten-url.port';
import { UpdateShortenUrlPort } from './application/port/out/update-shorten-url.port';
import { CountService } from './application/service/count.service';
import { CountServiceImpl } from './application/service/count.service-impl';
import { CreateShortenUrlServiceImpl } from './application/service/create-shorten-url.service-impl';
import { GetOriginalUrlServiceImpl } from './application/service/get-original-url.service-impl';
import { GetShortenUrlsServiceImpl } from './application/service/get-shorten-urls.service-impl';

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
    KafkaModule,
  ],
  controllers: [ShortenUrlController],
  providers: [
    ...repositories,
    ...services,
    ...ports,
    ...useCases,
    ShortenUrlConsumer,
  ],
})
export class ShortenUrlModule {}
