import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { Consumer } from 'src/util/consumer.utils';
import { MessageRepository } from '../persistence/message.adapter';
import { ShortenUrlRepository } from '../persistence/shorten-url.adapter';

@Processor('shortenUrlQueue')
export class ShortenUrlConsumer extends Consumer {
  constructor(
    protected readonly logger: Logger,
    @InjectQueue('deadLetterQueue') protected readonly daedLetterQueue: Queue,
    private readonly shortenUrlRepository: ShortenUrlRepository,
    private readonly messageRepository: MessageRepository,
  ) {
    super(logger, daedLetterQueue);
  }

  @Process('increaseVisitCountByKey')
  async increaseVisitCountByKey(job: Job): Promise<void> {
    try {
      await this.messageRepository.createMessage(<string>job.id);

      await this.shortenUrlRepository.increaseVisitCountByKey(job.data);
    } catch (err) {
      if (err.name === 'MongoServerError' && err.code === 11000) {
        return;
      }
      throw err;
    }
  }
}
