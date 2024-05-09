import { Injectable } from '@nestjs/common';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { GetShortenUrlsUseCase } from '../port/in/get-shorten-urls.use-case';
import { QueryShortenUrlPort } from '../port/out/qeury-shorten-url.port';

@Injectable()
export class GetShortenUrlsService implements GetShortenUrlsUseCase {
  constructor(private readonly queryShortenUrlPort: QueryShortenUrlPort) {}

  async execute(
    pageNumber: number,
    pageSize: number,
  ): Promise<{ shortenUrls: ShortenUrl[]; totalCount: number }> {
    const [shortenUrls, totalCount] = await Promise.all([
      this.queryShortenUrlPort.findShortenUrls(
        (pageNumber - 1) * pageSize,
        pageSize,
      ),
      this.queryShortenUrlPort.count(),
    ]);
    return { shortenUrls, totalCount };
  }
}
