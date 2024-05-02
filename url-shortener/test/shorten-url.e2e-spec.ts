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

  describe('/shorten-urls (POST)', () => {
    it('단축 URL 생성', async () => {
      // given
      const requestBody = {
        originalUrl: 'https://www.google.com',
      };

      // when
      const { statusCode, body: responseBody } = await request(
        app.getHttpServer(),
      )
        .post('/shorten-urls')
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
          request(app.getHttpServer()).post('/shorten-urls').send(requestBody),
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
        .post('/shorten-urls')
        .send(requestBody);
      const { body: responseBody2 } = await request(app.getHttpServer())
        .post('/shorten-urls')
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
          .post('/shorten-urls')
          .send(requestBody);

        // then
        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe('/shorten-urls');
        expect(responseBody.message).toBe('올바른 URL을 입력하세요.');
      });
    });
  });

  describe('/:shortenUrlKey (POST)', () => {
    it('원본 URL 리다이렉트', async () => {
      // given
      const originalUrl = 'https://www.google.com';
      const { body: shortenUrl } = await request(app.getHttpServer())
        .post('/shorten-urls')
        .send({ originalUrl });

      const shortenUrlKey = shortenUrl.key;

      // when
      const { statusCode, header } = await request(app.getHttpServer()).get(
        `/${shortenUrlKey}`,
      );

      // then
      expect(statusCode).toBe(HttpStatus.FOUND);
      expect(header.location).toBe(originalUrl);
    });

    it('동시성 테스트', async () => {
      // given
      const originalUrl = 'https://www.google.com';
      const { body: shortenUrl } = await request(app.getHttpServer())
        .post('/shorten-urls')
        .send({ originalUrl });

      const shortenUrlKey = shortenUrl.key;

      // when
      const tryCount = 10;
      const responses = await Promise.all(
        Array.from({ length: tryCount }, () =>
          request(app.getHttpServer()).get(`/${shortenUrlKey}`),
        ),
      );

      // then
      responses.forEach(({ statusCode, header }) => {
        expect(statusCode).toBe(HttpStatus.FOUND);
        expect(header.location).toBe(originalUrl);
      });
    });

    describe('잘못된 입력', () => {
      it('7글자가 아닌 단축 URL 키', async () => {
        // given
        const shortenUrlKey = 'wrong_shorten_url_key';

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(`/${shortenUrlKey}`);

        // then
        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(`/${shortenUrlKey}`);
        expect(responseBody.message).toBe('7자리 문자열을 입력하세요');
      });
    });

    describe('존재하지 않는 데이터', () => {
      it('존재하지 않는 단축 URL', async () => {
        // given
        const shortenUrlKey = '0000000';

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(`/${shortenUrlKey}`);

        // then
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(`/${shortenUrlKey}`);
        expect(responseBody.message).toBe('등록된 단축 URL이 아닙니다.');
      });
    });
  });
});
