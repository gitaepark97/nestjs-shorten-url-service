import { registerAs } from '@nestjs/config';
import {
  ConsumerConfig,
  Partitioners,
  ProducerConfig,
  logLevel,
} from 'kafkajs';
import { Environment } from './env.validation';

export const mqConfig = registerAs('mq', () => ({
  kafka: {
    brokers: process.env.KAFKA_BROKERS!.split(','),
    logLevel:
      process.env.NODE_ENV === Environment.Test
        ? logLevel.NOTHING
        : logLevel.ERROR,
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
