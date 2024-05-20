import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { ConfigModule } from 'src/config/config.module';
import { ShortenUrlCacheRepositoryImpl } from 'src/shorten-url/adapter/out/memory/shorten-url-cache.adapter';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { CreateShortenUrlCachePort } from './create-shorten-url-cache.port';

describe('CreateShortenUrlCachePort', () => {
  let port: CreateShortenUrlCachePort;
  let cache: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: CreateShortenUrlCachePort,
          useClass: ShortenUrlCacheRepositoryImpl,
        },
      ],
    }).compile();

    port = module.get<CreateShortenUrlCachePort>(CreateShortenUrlCachePort);
    cache = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(async () => {
    await cache.reset();
  });

  describe('createShortenUrlCache', () => {
    describe('성공', () => {
      it('단축 URL 저장', async () => {
        // given
        const shortenUrl = ShortenUrl.builder()
          .set('key', 'shortenUrlKey')
          .set('originalUrl', 'https://www.google.com')
          .build();

        // when
        await port.createShortenUrlCache(shortenUrl);

        // then
        const savedOriginalUrl = await cache.get(shortenUrl.key);
        expect(savedOriginalUrl).toBe('https://www.google.com');
      });
    });
  });
});
