import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';

export abstract class CommandShortenUrlPort {
  abstract save(shortenUrl: ShortenUrl): Promise<ShortenUrl>;
}
