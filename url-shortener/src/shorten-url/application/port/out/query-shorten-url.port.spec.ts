import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { ConfigModule } from 'src/config/config.module';
import { QueryShortenUrlAdapter } from 'src/shorten-url/adapter/out/persistence/query-shorten-url.adapter';
import {
  ShortenUrlEntity,
  ShortenUrlSchema,
} from 'src/shorten-url/adapter/out/persistence/shorten-url.entity';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { QueryShortenUrlPort } from './query-shorten-url.port';

describe('QueryShortenUrlPort', () => {
  let port: QueryShortenUrlPort;
  let mongooseConnection: Connection;

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
          provide: QueryShortenUrlPort,
          useClass: QueryShortenUrlAdapter,
        },
      ],
    }).compile();

    port = module.get<QueryShortenUrlPort>(QueryShortenUrlPort);
    mongooseConnection = module.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    await mongooseConnection.collection('shorten_urls').drop();
  });

  it('should be defined', () => {
    expect(port).toBeDefined();
  });

  describe('findShortenUrlByKey', () => {
    describe('단축 URL 검색', () => {
      it('존재 시', async () => {
        // given
        const shortenUrlKey = 'shortenUrlKey';
        const originalUrl = 'https://www.google.com';
        await mongooseConnection.collection('shorten_urls').insertOne({
          key: shortenUrlKey,
          originalUrl: originalUrl,
          visitCount: 0,
        });

        // when
        const result = await port.findShortenUrlByKey(shortenUrlKey);

        // then
        expect(result!.id).toEqual(expect.any(String));
        expect(result!.key).toBe(shortenUrlKey);
        expect(result!.originalUrl).toBe(originalUrl);
        expect(result!.visitCount).toEqual(expect.any(Number));
        expect(result!.createdAt).toEqual(expect.any(Date));
        expect(result!.updatedAt).toEqual(expect.any(Date));
      });

      it('미존재 시', async () => {
        // given
        const shortenUrlKey = 'shortenUrlKey';

        // when
        const result = await port.findShortenUrlByKey(shortenUrlKey);

        // then
        expect(result).toBeNull();
      });
    });

    describe('동시성 테스트', () => {
      it('존재 시', async () => {
        // given
        const shortenUrlKey = 'shortenUrlKey';
        const originalUrl = 'https://www.google.com';
        const shortenUrl = ShortenUrl.builder()
          .set('key', shortenUrlKey)
          .set('originalUrl', originalUrl)
          .build();
        await mongooseConnection.collection('shorten_urls').insertOne({
          key: shortenUrlKey,
          originalUrl: originalUrl,
          visitCount: 0,
        });

        // when
        const tryCount = 10;
        const results = await Promise.all(
          Array.from({ length: tryCount }, () =>
            port.findShortenUrlByKey(shortenUrl.key),
          ),
        );

        // then
        results.forEach((result) => {
          expect(result!.id).toEqual(expect.any(String));
          expect(result!.key).toBe(shortenUrlKey);
          expect(result!.originalUrl).toBe(originalUrl);
          expect(result!.visitCount).toEqual(expect.any(Number));
          expect(result!.createdAt).toEqual(expect.any(Date));
          expect(result!.updatedAt).toEqual(expect.any(Date));
        });
      });

      it('미존재 시', async () => {
        // given
        const shortenUrlKey = 'shortenUrlKey';

        // when
        const tryCount = 10;
        const results = await Promise.all(
          Array.from({ length: tryCount }, () =>
            port.findShortenUrlByKey(shortenUrlKey),
          ),
        );

        // then
        results.forEach((result) => {
          expect(result).toBeNull();
        });
      });
    });
  });
});
