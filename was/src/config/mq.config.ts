import { registerAs } from '@nestjs/config';
import {
  ConsumerConfig,
  Partitioners,
  ProducerConfig,
  logLevel,
} from 'kafkajs';

export const mqConfig = registerAs('mq', () => ({
  kafka: {
    brokers: process.env.KAFKA_BROKERS!.split(','),
    logLevel: logLevel.NOTHING,
  },
  producer: <ProducerConfig>{
    createPartitioner: Partitioners.LegacyPartitioner,
    idempotent: true,
  },
  consumer: <ConsumerConfig>{
    groupId: 'shorten-url-consumer',
  },
  retry: {
    retries: 3,
    initialRetryTime: 3000,
  },
}));
