import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer.service';
import { ShortenUrlRepository } from '../persistence/shorten-url.repository';

@Injectable()
export class ShortenUrlConsumer implements OnModuleInit {
  constructor(
    private readonly consumerService: ConsumerService,
    private readonly shortenUrlRepository: ShortenUrlRepository,
  ) {}

  async onModuleInit() {
    await this.consumerService.subscribe('increaseVisitCountByKey', {
      eachMessage: async ({ message }) => {
        await this.shortenUrlRepository.increaseVisitCountByKey(
          message.value!.toString(),
        );
      },
    });
  }
}
