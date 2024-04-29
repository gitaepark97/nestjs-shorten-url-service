import { Logger, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './exception/http-exception.filter';
import { LoggingInterceptor } from './logging/logging.interceptor';
import { RequestValidationPipe } from './validation/request-validatation.pipe';

@Module({
  providers: [
    Logger,
    { provide: APP_PIPE, useClass: RequestValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class CommonModule {}
