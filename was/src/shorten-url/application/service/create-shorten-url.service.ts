import { Injectable } from '@nestjs/common';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { CreateShortenUrlCommand } from '../port/in/command/create-shorten-url.command';
import { CreateShortenUrlUseCase } from '../port/in/create-shorten-url.use-case';
import { CreateShortenUrlCachePort } from '../port/out/create-shorten-url-cache.port';
import { CreateShortenUrlPort } from '../port/out/create-shorten-url.port';
import { CountService } from './count.service';

@Injectable()
export class CreateShortenUrlServiceImpl implements CreateShortenUrlUseCase {
  constructor(
    private readonly countService: CountService,
    private readonly createShortenUrlPort: CreateShortenUrlPort,
    private readonly createShortenUrlCachePort: CreateShortenUrlCachePort,
  ) {}

  async execute(command: CreateShortenUrlCommand): Promise<ShortenUrl> {
    // 단축 URL 키 생성
    const shortenUrlKey = await this.generateShortenUrlKey();

    // 단축 URL 생성
    let shortenUrl = ShortenUrl.builder()
      .set('key', shortenUrlKey)
      .set('originalUrl', command.originalUrl)
      .build();
    shortenUrl = await this.createShortenUrlPort.createShortenUrl(shortenUrl);

    // cache 생성
    await this.createShortenUrlCachePort.createShortenUrlCache(shortenUrl);
    return shortenUrl;
  }

  /**
   * 단축 URL 키 생성 함수
   */
  private async generateShortenUrlKey(): Promise<string> {
    // count 조회 및 증가
    const count = await this.countService.getCurrentCount();

    // count를 base64url로 인코딩
    return this.numberToBase64Url(count);
  }

  /**
   * 숫자를 base64url로 인코딩하는 함수
   */
  private numberToBase64Url(n: number): string {
    const base64urlChars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    for (let i = 0; i < 7; i++) {
      const index = n % 64;
      result = base64urlChars[index] + result;
      n = Math.floor(n / 64);
    }
    return result;
  }
}
