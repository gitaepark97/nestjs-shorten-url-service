import { Injectable, NotFoundException } from '@nestjs/common';
import { GetOriginalUrlUseCase } from '../port/in/get-original-url.use-case';
import { CreateShortenUrlCachePort } from '../port/out/create-shorten-url-cache.port';
import { LoadShortenUrlCachePort } from '../port/out/load-shorten-url-cache.port';
import { LoadShortenUrlPort } from '../port/out/load-shorten-url.port';
import { UpdateShortenUrlPort } from '../port/out/update-shorten-url.port';

@Injectable()
export class GetOriginalUrlServiceImpl implements GetOriginalUrlUseCase {
  constructor(
    private readonly loadShortenUrlCachePort: LoadShortenUrlCachePort,
    private readonly createShortenUrlCachePort: CreateShortenUrlCachePort,
    private readonly loadShortenUrlPort: LoadShortenUrlPort,
    private readonly updateShortenUrlPort: UpdateShortenUrlPort,
  ) {}

  async execute(shortenUrlKey: string): Promise<string> {
    // 단축 URL 검색
    // cache 검색
    let shortenUrl =
      await this.loadShortenUrlCachePort.findShortenUrlCache(shortenUrlKey);
    if (!shortenUrl) {
      // DB 검색
      shortenUrl =
        await this.loadShortenUrlPort.findShortenUrlByKey(shortenUrlKey);
      if (!shortenUrl)
        throw new NotFoundException('등록된 단축 URL이 아닙니다.');

      // cache 생성
      await this.createShortenUrlCachePort.createShortenUrlCache(shortenUrl);
    }

    // 단축 URL 조회 수 증가
    await this.updateShortenUrlPort.increaseVisitCountByKey(shortenUrl.key);

    return shortenUrl.originalUrl;
  }
}
