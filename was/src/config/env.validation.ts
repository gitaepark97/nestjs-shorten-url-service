import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumberString,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumberString()
  PORT: string;

  @IsNotEmpty()
  MONGODB_URI: string;

  @IsNumberString()
  CACHE_TTL: string;

  @IsNotEmpty()
  REDIS_MQ_HOST: string;
  @IsNumberString()
  REDIS_MQ_PORT: string;
  @IsNotEmpty()
  REDIS_MQ_PASSWORD: string;
}

export const validate = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
};
