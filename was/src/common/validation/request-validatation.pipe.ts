import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';

export class RequestValidationPipe extends ValidationPipe {
  constructor() {
    super({
      transform: true,
      whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (errs: ValidationError[]) => {
        const errorMessages = errs.flatMap(({ constraints }) =>
          Object.values(constraints!),
        );
        throw new BadRequestException(errorMessages[0]);
      },
    });
  }
}
