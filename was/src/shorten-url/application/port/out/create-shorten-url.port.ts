import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';

export abstract class CreateShortenUrlPort {
  abstract createShortenUrl(shortenUrl: ShortenUrl): Promise<ShortenUrl>;
}
