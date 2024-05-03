import { HttpStatus, INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection } from 'mongoose';
import { AppModule } from 'src/app.module';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
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
      it('원본 URL 미입력', async () => {
        // given
        const requestBody = {};

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

  describe('/shorten-urls/:shortenUrlKey (POST)', () => {
    it('원본 URL 리다이렉트', async () => {
      // given
      const originalUrl = 'https://www.google.com';
      const { body: shortenUrl } = await request(app.getHttpServer())
        .post('/shorten-urls')
        .send({ originalUrl });

      const shortenUrlKey = shortenUrl.key;

      // when
      const { statusCode, header } = await request(app.getHttpServer()).get(
        `/shorten-urls/${shortenUrlKey}`,
      );

      // then
      expect(statusCode).toBe(HttpStatus.FOUND);
      expect(header.location).toBe(originalUrl);

      const shortenUrlEntity = await mongooseConnection
        .collection('shorten_urls')
        .findOne({ key: shortenUrl.key });
      expect(shortenUrlEntity!.visitCount).toBe(1);
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
          request(app.getHttpServer()).get(`/shorten-urls/${shortenUrlKey}`),
        ),
      );

      // then
      responses.forEach(({ statusCode, header }) => {
        expect(statusCode).toBe(HttpStatus.FOUND);
        expect(header.location).toBe(originalUrl);
      });

      const shortenUrlEntity = await mongooseConnection
        .collection('shorten_urls')
        .findOne({ key: shortenUrl.key });
      expect(shortenUrlEntity!.visitCount).toBe(tryCount);
    });

    describe('잘못된 입력', () => {
      it('7글자가 아닌 단축 URL 키', async () => {
        // given
        const shortenUrlKey = 'wrong_shorten_url_key';

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(`/shorten-urls/${shortenUrlKey}`);

        // then
        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(`/shorten-urls/${shortenUrlKey}`);
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
        ).get(`/shorten-urls/${shortenUrlKey}`);

        // then
        expect(statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.statusCode).toBe(HttpStatus.NOT_FOUND);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(`/shorten-urls/${shortenUrlKey}`);
        expect(responseBody.message).toBe('등록된 단축 URL이 아닙니다.');
      });
    });
  });

  describe('/shorten-urls (GET)', () => {
    describe('단축 URL 목록 조회', () => {
      it('페이지 크기 미존재', async () => {
        // given
        const originalUrl = 'https://www.google.com';
        const totalCount = 10;
        await Promise.all(
          Array.from({ length: totalCount }, () =>
            request(app.getHttpServer())
              .post('/shorten-urls')
              .send({ originalUrl }),
          ),
        );

        const pageNumber = 1;

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(`/shorten-urls?pageNumber=${pageNumber}}`);

        // then
        expect(statusCode).toBe(HttpStatus.OK);
        expect(responseBody.shortenUrls.length).toBe(10);
        responseBody.shortenUrls.forEach((shortenUrl: ShortenUrl) => {
          expect(shortenUrl.key).toEqual(expect.any(String));
          expect(shortenUrl.key.length).toBe(7);
          expect(shortenUrl.originalUrl).toBe(originalUrl);
          expect(shortenUrl.visitCount).toEqual(expect.any(Number));
          expect(shortenUrl.createdAt).toEqual(expect.any(String));
          expect(shortenUrl.updatedAt).toEqual(expect.any(String));
        });
        expect(responseBody.totalCount).toBe(totalCount);
      });

      it('페이지 크기 존재', async () => {
        // given
        const originalUrl = 'https://www.google.com';
        const totalCount = 10;
        await Promise.all(
          Array.from({ length: totalCount }, () =>
            request(app.getHttpServer())
              .post('/shorten-urls')
              .send({ originalUrl }),
          ),
        );

        const pageNumber = 1;
        const pageSize = 5;

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(`/shorten-urls?pageNumber=${pageNumber}&pageSize=${pageSize}}`);

        // then
        expect(statusCode).toBe(HttpStatus.OK);
        expect(responseBody.shortenUrls.length).toBe(pageSize);
        responseBody.shortenUrls.forEach((shortenUrl: ShortenUrl) => {
          expect(shortenUrl.key).toEqual(expect.any(String));
          expect(shortenUrl.key.length).toBe(7);
          expect(shortenUrl.originalUrl).toBe(originalUrl);
          expect(shortenUrl.visitCount).toEqual(expect.any(Number));
          expect(shortenUrl.createdAt).toEqual(expect.any(String));
          expect(shortenUrl.updatedAt).toEqual(expect.any(String));
        });
        expect(responseBody.totalCount).toBe(totalCount);
      });
    });

    it('페이지 번호', async () => {
      // given
      const originalUrl = 'https://www.google.com';
      const totalCount = 10;
      await Promise.all(
        Array.from({ length: totalCount }, () =>
          request(app.getHttpServer())
            .post('/shorten-urls')
            .send({ originalUrl }),
        ),
      );

      const pageNumber1 = 1;
      const pageNumber2 = 2;
      const pageSize = 5;

      // when
      const { body: responseBody1 } = await request(app.getHttpServer()).get(
        `/shorten-urls?pageNumber=${pageNumber1}}`,
      );
      const { body: responseBody2 } = await request(app.getHttpServer()).get(
        `/shorten-urls?pageNumber=${pageNumber1}&pageSize=${pageSize}}`,
      );
      const { body: responseBody3 } = await request(app.getHttpServer()).get(
        `/shorten-urls?pageNumber=${pageNumber2}&pageSize=${pageSize}}`,
      );

      // then
      expect(responseBody2.shortenUrls).toEqual(
        responseBody1.shortenUrls.slice(
          (pageNumber1 - 1) * pageSize,
          pageNumber1 * pageSize,
        ),
      );
      expect(responseBody3.shortenUrls).toEqual(
        responseBody1.shortenUrls.slice(
          (pageNumber2 - 1) * pageSize,
          pageNumber2 * pageSize,
        ),
      );
    });

    describe('동시성 테스트', () => {
      it('페이지 크기 미존재', async () => {
        // given
        const originalUrl = 'https://www.google.com';
        const totalCount = 10;
        await Promise.all(
          Array.from({ length: totalCount }, () =>
            request(app.getHttpServer())
              .post('/shorten-urls')
              .send({ originalUrl }),
          ),
        );

        const pageNumber = 1;
        const pageSize = 5;

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer()).get(
              `/shorten-urls?pageNumber=${pageNumber}&pageSize=${pageSize}}`,
            ),
          ),
        );

        // then
        responses.forEach(({ statusCode, body: responseBody }) => {
          expect(statusCode).toBe(HttpStatus.OK);
          expect(responseBody.shortenUrls.length).toBe(pageSize);
          responseBody.shortenUrls.forEach((shortenUrl: ShortenUrl) => {
            expect(shortenUrl.key).toEqual(expect.any(String));
            expect(shortenUrl.key.length).toBe(7);
            expect(shortenUrl.originalUrl).toBe(originalUrl);
            expect(shortenUrl.visitCount).toEqual(expect.any(Number));
            expect(shortenUrl.createdAt).toEqual(expect.any(String));
            expect(shortenUrl.updatedAt).toEqual(expect.any(String));
          });
          expect(responseBody.totalCount).toBe(totalCount);
        });
      });

      it('페이지 크기 존재', async () => {
        // given
        const originalUrl = 'https://www.google.com';
        const totalCount = 10;
        await Promise.all(
          Array.from({ length: totalCount }, () =>
            request(app.getHttpServer())
              .post('/shorten-urls')
              .send({ originalUrl }),
          ),
        );

        const pageNumber = 1;

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer()).get(
              `/shorten-urls?pageNumber=${pageNumber}}`,
            ),
          ),
        );

        // then
        responses.forEach(({ statusCode, body: responseBody }) => {
          expect(statusCode).toBe(HttpStatus.OK);
          expect(responseBody.shortenUrls.length).toBe(10);
          responseBody.shortenUrls.forEach((shortenUrl: ShortenUrl) => {
            expect(shortenUrl.key).toEqual(expect.any(String));
            expect(shortenUrl.key.length).toBe(7);
            expect(shortenUrl.originalUrl).toBe(originalUrl);
            expect(shortenUrl.visitCount).toEqual(expect.any(Number));
            expect(shortenUrl.createdAt).toEqual(expect.any(String));
            expect(shortenUrl.updatedAt).toEqual(expect.any(String));
          });
          expect(responseBody.totalCount).toBe(totalCount);
        });
      });
    });

    describe('잘못된 입력', () => {
      it('페이지 번호 미입력', async () => {
        // given

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(`/shorten-urls`);

        // then
        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(`/shorten-urls`);
        expect(responseBody.message).toBe('자연수를 입력하세요');
      });

      it('자연수가 아닌 페이지 번호', async () => {
        // given
        const pageNumber = 0;

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(`/shorten-urls?pageNumber=${pageNumber}`);

        // then
        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(
          `/shorten-urls?pageNumber=${pageNumber}`,
        );
        expect(responseBody.message).toBe('자연수를 입력하세요');
      });

      it('자연수가 아닌 페이지 크기 ', async () => {
        // given
        const pageNumber = 1;
        const pageSize = 0;

        // when
        const { statusCode, body: responseBody } = await request(
          app.getHttpServer(),
        ).get(`/shorten-urls?pageNumber=${pageNumber}&pageSize=${pageSize}`);

        // then
        expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.statusCode).toBe(HttpStatus.BAD_REQUEST);
        expect(responseBody.timestamp).toEqual(expect.any(String));
        expect(responseBody.path).toBe(
          `/shorten-urls?pageNumber=${pageNumber}&pageSize=${pageSize}`,
        );
        expect(responseBody.message).toBe('자연수를 입력하세요');
      });
    });
  });
});
