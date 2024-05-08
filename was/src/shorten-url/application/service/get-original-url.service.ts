import { Injectable, NotFoundException } from '@nestjs/common';
import { GetOriginalUrlUseCase } from '../port/in/get-original-url.use-case';
import { GetOriginalUrlQuery } from '../port/in/query/get-original-url.query';
import { CommandShortenUrlPort } from '../port/out/command-shorten-url.port';
import { QueryShortenUrlPort } from '../port/out/query-shorten-url.port';

@Injectable()
export class GetOriginalUrlService implements GetOriginalUrlUseCase {
  constructor(
    private readonly queryShortenUrlPort: QueryShortenUrlPort,
    private readonly commandShortenUrlPort: CommandShortenUrlPort,
  ) {}

  async execute(query: GetOriginalUrlQuery): Promise<string> {
    // 단축 URL 검색
    const shortenUrl = await this.queryShortenUrlPort.findShortenUrlByKey(
      query.shortenUrlKey,
    );
    if (!shortenUrl) throw new NotFoundException('등록된 단축 URL이 아닙니다.');

    // 단축 URL 조회 수 증가
    await this.commandShortenUrlPort.increaseVisitCount(shortenUrl.id);

    return shortenUrl.originalUrl;
  }
}
