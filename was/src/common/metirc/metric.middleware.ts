import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { Histogram } from 'prom-client';

@Injectable()
export class MetricMiddleware implements NestMiddleware {
  private readonly httpRequestHistogram = new Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'statusCode'],
    buckets: [
      0.0001, 0.001, 0.005, 0.01, 0.025, 0.05, 0.075, 0.09, 0.1, 0.25, 0.5, 1,
      2.5, 5, 10,
    ],
  });

  use(request: Request, response: Response, next: NextFunction) {
    const start = Date.now();

    response.on('finish', () => {
      const responseTimeInMs = Date.now() - start;
      this.httpRequestHistogram
        .labels(
          request.method,
          request.route.path,
          response.statusCode.toString(),
        )
        .observe(responseTimeInMs);
    });

    next();
  }
}
