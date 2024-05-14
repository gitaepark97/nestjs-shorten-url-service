import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { ShortenUrlRepository } from '../persistence/shorten-url.adapter';

@Processor('shortenUrlQueue')
export class ShortenUrlConsumer {
  constructor(private readonly shortenUrlRepository: ShortenUrlRepository) {}

  @Process('increaseVisitCountByKey')
  async increaseVisitCountByKey(job: Job): Promise<void> {
    await this.shortenUrlRepository.increaseVisitCountByKey(job.data);
  }
}
