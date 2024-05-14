import { Injectable, NotFoundException } from '@nestjs/common';
import { GetOriginalUrlUseCase } from '../port/in/get-original-url.use-case';
import { LoadShortenUrlPort } from '../port/out/load-shorten-url.port';
import { UpdateShortenUrlPort } from '../port/out/update-shorten-url.port';

@Injectable()
export class GetOriginalUrlService implements GetOriginalUrlUseCase {
  constructor(
    private readonly loadShortenUrlPort: LoadShortenUrlPort,
    private readonly updateShortenUrlPort: UpdateShortenUrlPort,
  ) {}

  async execute(shortenUrlKey: string): Promise<string> {
    // 단축 URL 검색
    const shortenUrl =
      await this.loadShortenUrlPort.findShortenUrlByKey(shortenUrlKey);
    if (!shortenUrl) throw new NotFoundException('등록된 단축 URL이 아닙니다.');

    // 단축 URL 조회 수 증가
    await this.updateShortenUrlPort.increaseVisitCountByKey(shortenUrl.key);

    return shortenUrl.originalUrl;
  }
}
