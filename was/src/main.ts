import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { winstonLogger } from './common/logging/winston';
import { setUpSwagger } from './common/open-api/swagger';
import { serverConfig } from './config/server.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: winstonLogger });

  app.setGlobalPrefix('/api/v1');
  app.enableCors();
  app.use(helmet());

  setUpSwagger(app);

  const PORT = app.get(serverConfig.KEY).port;
  await app.listen(PORT);
}
bootstrap();
