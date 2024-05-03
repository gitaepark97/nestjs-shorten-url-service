import { Injectable } from '@nestjs/common';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { GetShortenUrlsUseCase } from '../port/in/get-shorten-urls.use-case';
import { GetShortenUrlsQuery } from '../port/in/query/get-shorten-urls.query';
import { QueryShortenUrlPort } from '../port/out/query-shorten-url.port';

@Injectable()
export class GetShortenUrlsService implements GetShortenUrlsUseCase {
  constructor(private readonly queryShortenUrlPort: QueryShortenUrlPort) {}

  async execute(
    query: GetShortenUrlsQuery,
  ): Promise<{ shortenUrls: ShortenUrl[]; totalCount: number }> {
    const [shortenUrls, totalCount] = await Promise.all([
      this.queryShortenUrlPort.findShortenUrls(
        (query.pageNumber - 1) * query.pageSize,
        query.pageSize,
      ),
      this.queryShortenUrlPort.count(),
    ]);
    return { shortenUrls, totalCount };
  }
}
