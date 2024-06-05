import {
  Global,
  Logger,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { Environment } from 'src/config/env.validation';
import { HttpExceptionFilter } from './exception/http-exception.filter';
import { HealthController } from './health/health.controller';
import { LoggingMiddleware } from './logging/logging.middleware';
import { MetricMiddleware } from './metirc/metric.middleware';
import { RequestValidationPipe } from './validation/request-validatation.pipe';

@Global()
@Module({
  imports: [TerminusModule, PrometheusModule.register()],
  controllers: [HealthController],
  providers: [
    Logger,
    { provide: APP_PIPE, useClass: RequestValidationPipe },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
  exports: [Logger],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer): any {
    if (process.env.NODE_ENV != Environment.Test) {
      consumer.apply(LoggingMiddleware).forRoutes('*');
      consumer.apply(MetricMiddleware).exclude('/metrics').forRoutes('*');
    }
  }
}
