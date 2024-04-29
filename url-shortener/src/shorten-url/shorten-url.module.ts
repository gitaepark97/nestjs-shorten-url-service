import { Module } from '@nestjs/common';
import { ShortenUrlController } from './adapter/in/web/shorten-url.controller';
import { CreateShortenUrlUseCase } from './application/port/in/create-shorten-url.use-case';

const useCases = [{ provide: CreateShortenUrlUseCase, useValue: {} }];

@Module({
  controllers: [ShortenUrlController],
  providers: [...useCases],
})
export class ShortenUrlModule {}
