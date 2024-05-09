import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent');

    let status, message;
    if (
      exception instanceof HttpException &&
      exception.getStatus() < HttpStatus.INTERNAL_SERVER_ERROR
    ) {
      [status, message] = [exception.getStatus(), exception.message];
      this.logger.warn(
        `${method} ${originalUrl} ${exception.getStatus()} ${ip} ${userAgent} - ${exception.message}`,
      );
    } else {
      [status, message] = [
        HttpStatus.INTERNAL_SERVER_ERROR,
        '서버 오류입니다. 잠시 후 재시도해주세요.',
      ];
      this.logger.error(
        `${method} ${originalUrl} ${HttpStatus.INTERNAL_SERVER_ERROR} ${ip} ${userAgent} - ${exception.message}`,
        exception.stack,
      );
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date(),
      path: request.url,
      message,
    });
  }
}
