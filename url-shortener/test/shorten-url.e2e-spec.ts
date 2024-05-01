import { HttpStatus, INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from 'src/app.module';
import request from 'supertest';

describe('ShortenUrlController (e2e)', () => {
  let app: INestApplication;
  let mongooseConnection: Connection;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    mongooseConnection = app.get<Connection>(getConnectionToken());
    await mongooseConnection.createCollection('counts');
    await mongooseConnection.collection('counts').insertOne({ current: 0 });
  });

  afterEach(async () => {
    await mongooseConnection.collection('counts').drop();
    await mongooseConnection.collection('shorten_urls').drop();
  });

  describe('/api/shorten-urls (POST)', () => {
    it('단축 URL 생성', async () => {
      // given
      const requestBody = {
        originalUrl: 'https://www.google.com',
      };

      // when
      const { statusCode, body: responseBody } = await request(
        app.getHttpServer(),
      )
        .post('/api/shorten-urls')
        .send(requestBody);

      // then
      expect(statusCode).toBe(HttpStatus.CREATED);
      expect(responseBody.key).toEqual(expect.any(String));
      expect(responseBody.key.length).toBe(7);
    });

    it('동시성 테스트', async () => {
      // given
      const requestBody = {
        originalUrl: 'https://www.google.com',
      };

      // when
      const tryCount = 10;
      const responses = await Promise.all(
        Array.from({ length: tryCount }, () =>
          request(app.getHttpServer())
            .post('/api/shorten-urls')
            .send(requestBody),
        ),
      );

      // then
      responses.forEach(({ statusCode, body: responseBody }) => {
        expect(statusCode).toBe(HttpStatus.CREATED);
        expect(responseBody.key).toEqual(expect.any(String));
        expect(responseBody.key.length).toBe(7);
      });
    });

    it('동일한 원본 URL로부터 2개의 단축 URL 생성', async () => {
      // given
      const requestBody = {
        originalUrl: 'https://www.google.com',
      };

      // when
      const { body: responseBody1 } = await request(app.getHttpServer())
        .post('/api/shorten-urls')
        .send(requestBody);
      const { body: responseBody2 } = await request(app.getHttpServer())
        .post('/api/shorten-urls')
        .send(requestBody);

      // then
      expect(responseBody1.key).not.toBe(responseBody2.key);
    });

    describe('잘못된 입력', () => {
      it('URL 형식이 아닌 원본 URL', async () => {
        // given
        const requestBody = {
          originalUrl: 'google',
        };

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        )
          .post('/api/shorten-urls')
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe('/api/shorten-urls');
        expect(responseBody.message).toBe('올바른 URL을 입력하세요.');
      });
    });
  });
});
