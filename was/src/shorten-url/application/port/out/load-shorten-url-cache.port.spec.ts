import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import { ConfigModule } from 'src/config/config.module';
import { ShortenUrlCacheAdapter } from 'src/shorten-url/adapter/out/memory/shorten-url-cache.adapter';
import { LoadShortenUrlCachePort } from './load-shorten-url-cache.port';

describe('LoadShortenUrlCachePort', () => {
  let port: LoadShortenUrlCachePort;
  let cache: Cache;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        {
          provide: LoadShortenUrlCachePort,
          useClass: ShortenUrlCacheAdapter,
        },
      ],
    }).compile();

    port = module.get<LoadShortenUrlCachePort>(LoadShortenUrlCachePort);
    cache = module.get<Cache>(CACHE_MANAGER);
  });

  afterEach(async () => {
    await cache.reset();
  });

  describe('findShortenUrlCache', () => {
    describe('성공', () => {
      it('단축 URL 존재', async () => {
        // given
        await cache.set('shortenUrlKey', 'https://www.google.com');

        const shortenUrlKey = 'shortenUrlKey';

        // when
        const result = await port.findShortenUrlCache(shortenUrlKey);

        // then
        expect(result!.key).toBe(shortenUrlKey);
        expect(result!.originalUrl).toBe('https://www.google.com');
      });

      it('단축 URL 미존재', async () => {
        // given
        const shortenUrlKey = 'shortenUrlKey';

        // when
        const result = await port.findShortenUrlCache(shortenUrlKey);

        // then
        expect(result).toBeNull();
      });
    });
  });
});
