import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';

export abstract class CreateShortenUrlCachePort {
  abstract createShortenUrlCache(shortenUrl: ShortenUrl): Promise<void>;
}
