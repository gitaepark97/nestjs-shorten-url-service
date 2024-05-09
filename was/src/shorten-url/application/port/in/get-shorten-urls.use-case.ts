import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';

export abstract class GetShortenUrlsUseCase {
  abstract execute(
    pageNumber: number,
    pageSize: number,
  ): Promise<{ shortenUrls: ShortenUrl[]; totalCount: number }>;
}
