import { registerAs } from '@nestjs/config';

export const mqConfig = registerAs('mq', () => ({
  redis: {
    host: process.env.REDIS_MQ_HOST,
    port: parseInt(process.env.REDIS_MQ_PORT!),
    password: process.env.REDIS_MQ_PASSWORD,
  },
}));
