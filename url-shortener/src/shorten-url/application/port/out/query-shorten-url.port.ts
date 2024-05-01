import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';

export abstract class QueryShortenUrlPort {
  abstract findShortenUrl(shortenUrlKey: string): Promise<ShortenUrl | null>;
}
