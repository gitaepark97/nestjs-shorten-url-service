import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { ConfigModule } from 'src/config/config.module';
import {
  ShortenUrlEntity,
  ShortenUrlSchema,
} from 'src/shorten-url/adapter/out/persistence/entity/shorten-url.entity';
import { ShortenUrlAdapter } from 'src/shorten-url/adapter/out/persistence/shorten-url.adapter';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { CreateShortenUrlPort } from './create-shorten-url.port';

describe('CommandShortenUrlPort', () => {
  let port: CreateShortenUrlPort;
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
          provide: CreateShortenUrlPort,
          useClass: ShortenUrlAdapter,
        },
      ],
    }).compile();

    port = module.get<CreateShortenUrlPort>(CreateShortenUrlPort);
    db = module.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    await db.collection('shorten_urls').drop();
  });

  describe('createShortenUrl', () => {
    describe('성공', () => {
      it('단축 URL 저장', async () => {
        // given
        const shortenUrl = ShortenUrl.builder()
          .set('key', 'shortenUrlKey')
          .set('originalUrl', 'https://www.google.com')
          .build();

        // when
        const result = await port.createShortenUrl(shortenUrl);

        // then
        expect(result.key).toBe(shortenUrl.key);
        expect(result.originalUrl).toBe(shortenUrl.originalUrl);
        expect(result.visitCount).toBe(0);
        expect(result.createdAt).toEqual(expect.any(Date));
        expect(result.updatedAt).toEqual(expect.any(Date));
      });
    });
  });
});
