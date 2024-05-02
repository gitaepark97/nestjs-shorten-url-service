import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { GetShortenUrlsQuery } from './query/get-shorten-urls.query';

export abstract class GetShortenUrlsUseCase {
  abstract execute(query: GetShortenUrlsQuery): Promise<ShortenUrl[]>;
}
