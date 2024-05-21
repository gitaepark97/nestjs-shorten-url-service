import { Injectable } from '@nestjs/common';
import { ProducerService } from 'src/kafka/producer.service';
import { UpdateShortenUrlPort } from 'src/shorten-url/application/port/out/update-shorten-url.port';

@Injectable()
export class ShortenUrlProducer implements UpdateShortenUrlPort {
  constructor(private readonly producerService: ProducerService) {}

  async increaseVisitCountByKey(shortenUrlKey: string): Promise<void> {
    await this.producerService.send({
      topic: 'increaseVisitCountByKey',
      messages: [{ value: shortenUrlKey }],
    });
  }
}
