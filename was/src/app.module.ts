import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from './config/config.module';
import { CounterModule } from './counter/counter.module';
import { ShortenUrlModule } from './shorten-url/shorten-url.module';

@Module({
  imports: [ConfigModule, CommonModule, ShortenUrlModule, CounterModule],
})
export class AppModule {}
