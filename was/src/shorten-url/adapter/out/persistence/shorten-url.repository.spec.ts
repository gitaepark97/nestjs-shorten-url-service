import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { ConfigModule } from 'src/config/config.module';
import {
  ShortenUrlEntity,
  ShortenUrlSchema,
} from 'src/shorten-url/adapter/out/persistence/entity/shorten-url.entity';
import {
  ShortenUrlAdapter,
  ShortenUrlRepository,
} from 'src/shorten-url/adapter/out/persistence/shorten-url.adapter';

describe('ShortenUrlRepository', () => {
  let repository: ShortenUrlRepository;
  let db: Connection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule,
        MongooseModule.forFeature([
          { name: ShortenUrlEntity.name, schema: ShortenUrlSchema },
        ]),
      ],
      providers: [
        {
          provide: ShortenUrlRepository,
          useClass: ShortenUrlAdapter,
        },
      ],
    }).compile();

    repository = module.get<ShortenUrlRepository>(ShortenUrlRepository);
    db = module.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    await db.collection('shorten_urls').drop();
  });

  describe('increaseVisitCountByKey', () => {
    describe('성공', () => {
      it('단축 URL 조회 수 증가', async () => {
        // given
        await db.collection('shorten_urls').insertOne({
          key: 'shortenUrlKey',
          originalUrl: 'https://www.google.com',
          visitCount: 0,
        });

        const shortenUrlKey = 'shortenUrlKey';

        // when
        await repository.increaseVisitCountByKey(shortenUrlKey);

        // then
        const savedShortenUrl = await db
          .collection('shorten_urls')
          .findOne({ key: shortenUrlKey });
        expect(savedShortenUrl!.visitCount).toBe(1);
      });
    });
  });
});
