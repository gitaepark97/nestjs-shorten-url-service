import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { HealthModule } from './health/health.module';
import { ShortenUrlModule } from './shorten-url/shorten-url.module';
import { CounterModule } from './counter/counter.module';

@Module({
  imports: [ConfigModule, CommonModule, HealthModule, ShortenUrlModule, CounterModule],
})
export class AppModule {}
