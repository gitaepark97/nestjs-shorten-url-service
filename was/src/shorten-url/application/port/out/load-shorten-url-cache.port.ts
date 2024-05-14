import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';

export abstract class LoadShortenUrlCachePort {
  abstract findShortenUrlCache(
    shortenUrlKey: string,
  ): Promise<ShortenUrl | null>;
}
