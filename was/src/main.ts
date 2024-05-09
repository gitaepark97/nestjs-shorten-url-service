import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { winstonLogger } from './common/logging/winston';
import { setUpSwagger } from './common/open-api/swagger';
import { serverConfig } from './config/server.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: winstonLogger });

  const config = app.get(serverConfig.KEY);

  app.setGlobalPrefix('/api/v1');
  app.enableCors();
  app.use(helmet());

  setUpSwagger(app);

  await app.listen(config.port);
}
bootstrap();
