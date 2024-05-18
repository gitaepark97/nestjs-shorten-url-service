import { OnQueueFailed, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job, Queue } from 'bull';

@Processor()
export class Consumer {
  constructor(
    protected readonly logger: Logger,
    protected readonly deadLetterQueue: Queue,
  ) {}

  @OnQueueFailed()
  async handleFailed(job: Job, err: Error): Promise<void> {
    const maxAttempt = job.opts.attempts ?? 1;
    if (job.attemptsMade >= maxAttempt) {
      this.logger.error('Dead Letter', err.stack);
      await this.deadLetterQueue.add(job.name, job.data, {
        removeOnComplete: true,
        removeOnFail: true,
      });
    }
  }
}
