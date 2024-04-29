import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
} from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { Observable, switchMap } from 'rxjs';

@Injectable()
export class ResponseValidationInterceptor<T extends object>
  implements NestInterceptor<any, T>
{
  constructor(private readonly responseModel: new () => T) {}

  intercept(_: ExecutionContext, next: CallHandler): Observable<T> {
    return next.handle().pipe(
      switchMap(async (data) => {
        const transformedData = plainToInstance(
          this.responseModel,
          instanceToPlain(data),
        );
        try {
          await validateOrReject(transformedData, { stopAtFirstError: true });

          return transformedData;
        } catch (err) {
          throw new InternalServerErrorException('Response validation failed');
        }
      }),
    );
  }
}
