import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from 'src/config/config.module';
import { KafkaModule } from 'src/kafka/kafka.module';
import { ProducerService } from 'src/kafka/producer.service';
import { ShortenUrlProducer } from 'src/shorten-url/adapter/out/mq/shorten-url.producer';
import { UpdateShortenUrlPort } from './update-shorten-url.port';

describe('UpdateShortenUrlPort', () => {
  let port: UpdateShortenUrlPort;
  let producerService: ProducerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, KafkaModule],
      providers: [
        {
          provide: UpdateShortenUrlPort,
          useClass: ShortenUrlProducer,
        },
      ],
    }).compile();

    port = module.get<UpdateShortenUrlPort>(UpdateShortenUrlPort);
    producerService = module.get<ProducerService>(ProducerService);
    await producerService.onModuleInit();
  }, 10000);

  afterEach(async () => {
    await producerService.onApplicationShutdown();
  });

  describe('increaseVisitCountByKey', () => {
    describe('성공', () => {
      it('단축 URL 조회 수 증가', async () => {
        // given
        const shortenUrlKey = 'shortenUrlKey';

        // when
        await port.increaseVisitCountByKey(shortenUrlKey);

        // then
      });
    });
  });
});
