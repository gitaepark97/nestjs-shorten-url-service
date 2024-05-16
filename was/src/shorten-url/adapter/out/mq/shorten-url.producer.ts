import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { UpdateShortenUrlPort } from 'src/shorten-url/application/port/out/update-shorten-url.port';

@Injectable()
export class ShortenUrlProducer implements UpdateShortenUrlPort {
  constructor(
    @InjectQueue('shortenUrlQueue')
    private readonly shortenUrlQueue: Queue,
  ) {}

  async increaseVisitCountByKey(shortenUrlKey: string): Promise<void> {
    await this.shortenUrlQueue.add('increaseVisitCountByKey', shortenUrlKey, {
      attempts: 3,
      backoff: 1000,
    });
  }
}
