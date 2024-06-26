import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';

export abstract class LoadShortenUrlPort {
  abstract findShortenUrlByKey(
    shortenUrlKey: string,
  ): Promise<ShortenUrl | null>;
  abstract findShortenUrls(skip: number, limit: number): Promise<ShortenUrl[]>;
  abstract count(): Promise<number>;
}
