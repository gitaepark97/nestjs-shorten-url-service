import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Environment } from 'src/config/env.validation';

export const setUpSwagger = (app: INestApplication): void => {
  const config = new DocumentBuilder()
    .setTitle('단축 URL 서비스')
    .setDescription(
      `단축 URL을 생성해주는 서비스 ${process.env.NODE_ENV == Environment.Production ? '운영' : '개발'} 환경 API 문서입니다.`,
    )
    .setVersion('1.0.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
};
