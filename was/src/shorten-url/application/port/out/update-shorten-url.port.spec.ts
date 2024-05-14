import { BullModule, getQueueToken } from '@nestjs/bull';
import { Test, TestingModule } from '@nestjs/testing';
import { Queue } from 'bull';
import { ConfigModule } from 'src/config/config.module';
import { ShortenUrlProducer } from 'src/shorten-url/adapter/out/mq/shorten-url.producer';
import { UpdateShortenUrlPort } from './update-shorten-url.port';

describe('UpdateShortenUrlPort', () => {
  let port: UpdateShortenUrlPort;
  let queue: Queue;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        BullModule.registerQueue({ name: 'shortenUrlQueue' }),
      ],
      providers: [
        {
          provide: UpdateShortenUrlPort,
          useClass: ShortenUrlProducer,
        },
      ],
    }).compile();

    port = module.get<UpdateShortenUrlPort>(UpdateShortenUrlPort);
    queue = module.get<Queue>(getQueueToken('shortenUrlQueue'));
  });

  afterEach(async () => {
    await queue.empty();
  });

  describe('increaseVisitCountByKey', () => {
    describe('성공', () => {
      it('단축 URL 조회 수 증가', async () => {
        // given
        const shortenUrlKey = 'shortenUrlKey';

        // when
        await port.increaseVisitCountByKey(shortenUrlKey);

        // then
        const jobs = await queue.getJobs(['waiting']);
        expect(jobs).toHaveLength(1);
        expect(jobs[0].data).toEqual(shortenUrlKey);
      });
    });
  });
});
