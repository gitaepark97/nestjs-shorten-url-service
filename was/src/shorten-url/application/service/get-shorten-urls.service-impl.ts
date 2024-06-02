import { Injectable } from '@nestjs/common';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { GetShortenUrlsUseCase } from '../port/in/get-shorten-urls.use-case';
import { LoadShortenUrlPort } from '../port/out/load-shorten-url.port';

@Injectable()
export class GetShortenUrlsServiceImpl implements GetShortenUrlsUseCase {
  constructor(private readonly loadShortenUrlPort: LoadShortenUrlPort) {}

  async execute(
    pageNumber: number,
    pageSize: number,
  ): Promise<{ shortenUrls: ShortenUrl[]; totalCount: number }> {
    const [shortenUrls, totalCount] = await Promise.all([
      this.loadShortenUrlPort.findShortenUrls(
        (pageNumber - 1) * pageSize,
        pageSize,
      ),
      this.loadShortenUrlPort.count(),
    ]);
    return { shortenUrls, totalCount };
  }
}
