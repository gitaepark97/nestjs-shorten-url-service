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
import { CommandShortenUrlPort } from './command-shorten-url.port';

describe('CommandShortenUrlPort', () => {
  let port: CommandShortenUrlPort;
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
          provide: CommandShortenUrlPort,
          useClass: ShortenUrlAdapter,
        },
      ],
    }).compile();

    port = module.get<CommandShortenUrlPort>(CommandShortenUrlPort);
    mongooseConnection = module.get<Connection>(getConnectionToken());
  });

  afterEach(async () => {
    await mongooseConnection.collection('shorten_urls').drop();
  });

  describe('save', () => {
    describe('성공', () => {
      it('단축 URL 저장', async () => {
        // given
        const shortenUrlKey = 'shortenUrlKey';
        const originalUrl = 'https://www.google.com';
        const shortenUrl = ShortenUrl.builder()
          .set('key', shortenUrlKey)
          .set('originalUrl', originalUrl)
          .build();

        // when
        const result = await port.save(shortenUrl);

        // then
        expect(result.id).toEqual(expect.any(String));
        expect(result.key).toBe(shortenUrl.key);
        expect(result.originalUrl).toBe(shortenUrl.originalUrl);
        expect(result.visitCount).toBe(0);
        expect(result.createdAt).toEqual(expect.any(Date));
        expect(result.updatedAt).toEqual(expect.any(Date));
      });
    });

    describe('동시성 테스트', () => {
      it('단축 URL 저장', async () => {
        // given
        const tryCount = 10;
        const originalUrl = 'https://www.google.com';
        const shortenUrls = Array.from({ length: tryCount }, (_, idx) =>
          ShortenUrl.builder()
            .set('key', `shortenUrlKey${idx + 1}`)
            .set('originalUrl', originalUrl)
            .build(),
        );

        // when
        const results = await Promise.all(
          Array.from({ length: tryCount }, (_, idx) =>
            port.save(shortenUrls[idx]),
          ),
        );

        // then
        results.forEach((result, idx) => {
          expect(result.id).toEqual(expect.any(String));
          expect(result.key).toBe(shortenUrls[idx].key);
          expect(result.originalUrl).toBe(shortenUrls[idx].originalUrl);
          expect(result.visitCount).toBe(0);
          expect(result.createdAt).toEqual(expect.any(Date));
          expect(result.updatedAt).toEqual(expect.any(Date));
        });
      });
    });
  });

  describe('increaseVisitCount', () => {
    describe('성공', () => {
      it('단축 URL 조회 수 증가', async () => {
        // given
        const shortenUrlKey = 'shortenUrlKey';
        const originalUrl = 'https://www.google.com';
        let shortenUrl = ShortenUrl.builder()
          .set('key', shortenUrlKey)
          .set('originalUrl', originalUrl)
          .build();
        shortenUrl = await port.save(shortenUrl);

        // when
        await port.increaseVisitCount(shortenUrl.id);

        // then
        const shortenUrlEntity = await mongooseConnection
          .collection('shorten_urls')
          .findOne({ key: shortenUrl.key });
        expect(shortenUrlEntity!.visitCount).toBe(shortenUrl.visitCount + 1);
      });
    });

    describe('동시성 테스트', () => {
      it('단축 URL 조회 수 증가', async () => {
        // given
        const shortenUrlKey = 'shortenUrlKey';
        const originalUrl = 'https://www.google.com';
        let shortenUrl = ShortenUrl.builder()
          .set('key', shortenUrlKey)
          .set('originalUrl', originalUrl)
          .build();
        shortenUrl = await port.save(shortenUrl);

        // when
        const tryCount = 10;
        await Promise.all(
          Array.from({ length: tryCount }, () =>
            port.increaseVisitCount(shortenUrl.id),
          ),
        );

        // then
        const shortenUrlEntity = await mongooseConnection
          .collection('shorten_urls')
          .findOne({ key: shortenUrl.key });
        expect(shortenUrlEntity!.visitCount).toBe(
          shortenUrl.visitCount + tryCount,
        );
      });
    });
  });
});
