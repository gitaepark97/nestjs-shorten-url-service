import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';

export abstract class QueryShortenUrlPort {
  abstract findShortenUrlByKey(
    shortenUrlKey: string,
  ): Promise<ShortenUrl | null>;
  abstract findShortenUrls(
    offset: number,
    limit: number,
  ): Promise<ShortenUrl[]>;
  abstract count(): Promise<number>;
}
