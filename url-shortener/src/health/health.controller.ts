import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { IsNumber } from 'class-validator';
import { ResponseValidationInterceptor } from 'src/common/validation/response-validation.interceptor';

class Test {
  @IsNumber()
  status: number;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @HealthCheck()
  @UseInterceptors(new ResponseValidationInterceptor(Test))
  check() {
    return this.health.check([]);
  }
}
