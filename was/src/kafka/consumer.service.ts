import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import {
  Consumer,
  ConsumerRunConfig,
  EachMessageHandler,
  EachMessagePayload,
  Kafka,
  KafkaMessage,
} from 'kafkajs';
import { mqConfig } from 'src/config/mq.config';
import { ProducerService } from './producer.service';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly kafka: Kafka;
  private readonly consumers: Consumer[] = [];
  private readonly maxRetryCount: number;
  private readonly retryDelay: number;

  constructor(
    @Inject(mqConfig.KEY) private readonly config: ConfigType<typeof mqConfig>,
    private readonly producerService: ProducerService,
  ) {
    this.kafka = new Kafka(config.kafka);
    this.maxRetryCount = config.retry.retries;
    this.retryDelay = config.retry.initialRetryTime;
  }

  async subscribe(topic: string, config: ConsumerRunConfig): Promise<void> {
    const consumer = this.kafka.consumer(this.config.consumer);
    await consumer.connect();
    await consumer.subscribe({ topic });
    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        config.eachMessage &&
          (await this.handleMessageWithRetry(payload, config.eachMessage));
      },
    });
    this.consumers.push(consumer);
  }

  async onApplicationShutdown(): Promise<void> {
    for (const consumer of this.consumers) {
      await consumer.disconnect();
    }
  }

  private async handleMessageWithRetry(
    payload: EachMessagePayload,
    eachMessage: EachMessageHandler,
  ): Promise<void> {
    let retryCount = 0;

    while (true) {
      try {
        await eachMessage(payload);
        break;
      } catch (err) {
        retryCount++;
        if (retryCount >= this.maxRetryCount) {
          await this.sendToDeadLetterTopic(payload.topic, payload.message);
          break;
        } else {
          await new Promise((resolve) => setTimeout(resolve, this.retryDelay));
        }
      }
    }
  }

  private async sendToDeadLetterTopic(topic: string, message: KafkaMessage) {
    await this.producerService.send({
      topic: `${topic}DeadLetterTopic`,
      messages: [message],
    });
  }
}
