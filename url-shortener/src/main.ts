import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { setUpSwagger } from './util/swagger.util';
import { winstonLogger } from './util/winston.util';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: winstonLogger });

  const config = app.get(ConfigService);

  app.enableCors();
  app.use(helmet());

  setUpSwagger(app);

  await app.listen(config.get('port')!);
}
bootstrap();
