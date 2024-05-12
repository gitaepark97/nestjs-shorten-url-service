import { MongooseModule, getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { ConfigModule } from 'src/config/config.module';
import {
  ShortenUrlEntity,
  ShortenUrlSchema,
} from 'src/shorten-url/adapter/out/persistence/entity/shorten-url.entity';
import { ShortenUrlAdapter } from 'src/shorten-url/adapter/out/persistence/shorten-url.adapter';
import { QueryShortenUrlPort } from './qeury-shorten-url.port';

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
          useClass: ShortenUrlAdapter,
        },
      ],
    }).compile();

    port = module.get<QueryShortenUrlPort>(QueryShortenUrlPort);
    mongooseConnection = module.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    await mongooseConnection.collection('shorten_urls').drop();
  });

  describe('findShortenUrlByKey', () => {
    describe('성공', () => {
      it('key에 해당하는 단축 URL 존재', async () => {
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

      it('key에 해당하는 단축 URL 미존재', async () => {
        // given
        const shortenUrlKey = 'shortenUrlKey';

        // when
        const result = await port.findShortenUrlByKey(shortenUrlKey);

        // then
        expect(result).toBeNull();
      });
    });
  });

  describe('findShortenUrls', () => {
    describe('성공', () => {
      it('단축 URL 검색', async () => {
        // given
        const totalCount = 10;
        const originalUrl = 'https://www.google.com';

        await Promise.all(
          Array.from({ length: totalCount }, (_, idx) =>
            mongooseConnection.collection('shorten_urls').insertOne({
              key: `shortenUrlKey${idx}`,
              originalUrl: originalUrl,
              visitCount: 0,
            }),
          ),
        );
        const skip = 0;
        const limit = 5;

        // when
        const result = await port.findShortenUrls(skip, limit);

        // then
        expect(result.length).toBe(limit);
        const shortenUrlMap = new Map();
        result.forEach((shortenUrl) => {
          shortenUrlMap.set(shortenUrl.key, true);
          expect(shortenUrl.id).toEqual(expect.any(String));
          expect(shortenUrl.originalUrl).toBe(originalUrl);
          expect(shortenUrl.visitCount).toEqual(expect.any(Number));
          expect(shortenUrl.createdAt).toEqual(expect.any(Date));
          expect(shortenUrl.updatedAt).toEqual(expect.any(Date));
        });
        expect(Array.from(shortenUrlMap).length).toBe(limit);
      });

      it('skip 작동', async () => {
        // given
        const totalCount = 10;
        const originalUrl = 'https://www.google.com';

        await Promise.all(
          Array.from({ length: totalCount }, (_, idx) =>
            mongooseConnection.collection('shorten_urls').insertOne({
              key: `shortenUrlKey${idx}`,
              originalUrl: originalUrl,
              visitCount: 0,
            }),
          ),
        );
        const skip1 = 0;
        const skip2 = 5;
        const limit1 = 10;
        const limit2 = 5;

        // when
        const result1 = await port.findShortenUrls(skip1, limit1);
        const result2 = await port.findShortenUrls(skip1, limit2);
        const result3 = await port.findShortenUrls(skip2, limit2);

        // then
        expect(result2).toEqual(result1.slice(skip1, skip1 + limit2));
        expect(result3).toEqual(result1.slice(skip2, skip2 + limit2));
      });
    });
  });

  describe('count', () => {
    describe('성공', () => {
      it('단축 URL count', async () => {
        // given
        const totalCount = 10;
        const originalUrl = 'https://www.google.com';

        await Promise.all(
          Array.from({ length: totalCount }, (_, idx) =>
            mongooseConnection.collection('shorten_urls').insertOne({
              key: `shortenUrlKey${idx}`,
              originalUrl: originalUrl,
              visitCount: 0,
            }),
          ),
        );

        // when
        const result = await port.count();

        // then
        expect(result).toBe(totalCount);
      });
    });
  });
});