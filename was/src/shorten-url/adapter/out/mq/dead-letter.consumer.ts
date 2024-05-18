import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { Consumer } from 'src/util/consumer.utils';
import { ShortenUrlRepository } from '../persistence/shorten-url.repository';

@Processor('daedLetterQueue')
export class DeadLetterConsumer extends Consumer {
  constructor(
    protected readonly logger: Logger,
    @InjectQueue('deadLetterQueue') protected readonly daedLetterQueue: Queue,
    private readonly shortenUrlRepository: ShortenUrlRepository,
  ) {
    super(logger, daedLetterQueue);
  }

  @Process('increaseVisitCountByKey')
  async increaseVisitCountByKey(job: Job): Promise<void> {
    await this.shortenUrlRepository.increaseVisitCountByKey(job.data);
  }
}
