import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import { mqConfig } from 'src/config/mq.config';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka: Kafka;
  private readonly producer: Producer;

  constructor(
    @Inject(mqConfig.KEY) private readonly config: ConfigType<typeof mqConfig>,
  ) {
    this.kafka = new Kafka(config.kafka);
    this.producer = this.kafka.producer(this.config.producer);
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
  }

  async send(record: ProducerRecord): Promise<void> {
    await this.producer.send(record);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.producer.disconnect();
  }
}
