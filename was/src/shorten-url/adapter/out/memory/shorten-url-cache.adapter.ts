import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CreateShortenUrlCachePort } from 'src/shorten-url/application/port/out/create-shorten-url-cache.port';
import { LoadShortenUrlCachePort } from 'src/shorten-url/application/port/out/load-shorten-url-cache.port';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';

@Injectable()
export class ShortenUrlCacheAdapter
  implements LoadShortenUrlCachePort, CreateShortenUrlCachePort
{
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManage: Cache) {}

  async findShortenUrlCache(shortenUrlKey: string): Promise<ShortenUrl | null> {
    const originalUrl = await this.cacheManage.get(shortenUrlKey);
    return originalUrl ? <ShortenUrl>{ key: shortenUrlKey, originalUrl } : null;
  }

  async createShortenUrlCache(shortenUrl: ShortenUrl): Promise<void> {
    await this.cacheManage.set(shortenUrl.key, shortenUrl.originalUrl);
  }
}
