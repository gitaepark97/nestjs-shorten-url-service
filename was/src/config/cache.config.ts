import { registerAs } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';
import { RedisClientOptions } from 'redis';

export const cacheConfig = registerAs(
  'cache',
  () =>
    <RedisClientOptions>{
      store: redisStore,
      url: process.env.REDIS_URL,
      ttl: parseInt(process.env.CACHE_TTL!),
    },
);
