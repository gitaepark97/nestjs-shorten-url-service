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
  // let producerService: ProducerService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
  });

  beforeEach(async () => {
    await app.init();

    mongooseConnection = app.get<Connection>(getConnectionToken());
    // producerService = app.get<ProducerService>(ProducerService);
    await mongooseConnection.createCollection('counts');
    await mongooseConnection.collection('counts').insertOne({ current: 0 });
  }, 30000);

  afterEach(async () => {
    await mongooseConnection.collection('counts').drop();
    await mongooseConnection.collection('shorten_urls').drop();
  });

  describe('/shorten-urls (POST)', () => {
    describe('201 Created', () => {
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
    });

    describe('400 Bad Request', () => {
      describe('원본 URL', () => {
        it('미입력', async () => {
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

        it('문자열 아닌 데이터 입력', async () => {
          // given
          const requestBody = {
            originalUrl: 1,
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

        it('URL 형식이 아닌 문자열 입력', async () => {
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

    describe('동시성 테스트', () => {
      it('단축 URL 생성', async () => {
        // given
        const requestBody = {
          originalUrl: 'https://www.google.com',
        };

        // when
        const tryCount = 10;
        const responses = await Promise.all(
          Array.from({ length: tryCount }, () =>
            request(app.getHttpServer())
              .post('/shorten-urls')
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
    });
  });

  describe('/shorten-urls/:shortenUrlKey (POST)', () => {
    describe('200 OK', () => {
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
      });
    });

    describe('400 Bad Request', () => {
      describe('단축 URL 키', () => {
        it('7글자가 아닌 문자열', async () => {
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
    });

    describe('404 Not Found', () => {
      it('단축 URL', async () => {
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

    describe('동시성 테스트', () => {
      it('원본 URL 리다이렉트', async () => {
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
      });
    });
  });

  describe('/shorten-urls (GET)', () => {
    describe('200 OK', () => {
      it('페이지 번호 조건', async () => {
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

      it('페이지 번호와 페이지 크기 조건', async () => {
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

    describe('400 Bad Request', () => {
      describe('페이지 번호', () => {
        it('미입력', async () => {
          // given

          // when
          const { statusCode, body: responseBody } = await request(
            app.getHttpServer(),
          ).get(`/shorten-urls`);

          // then
          expect(statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.statusCode).toBe(HttpStatus.BAD_REQUEST);
          expect(responseBody.timestamp).toEqual(expect.any(String));
          expect(responseBody.path).toBe('/shorten-urls');
          expect(responseBody.message).toBe('자연수를 입력하세요');
        });

        it('자연수가 아닌 숫자', async () => {
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
          expect(responseBody.path).toBe('/shorten-urls');
          expect(responseBody.message).toBe('자연수를 입력하세요');
        });
      });

      describe('페이지 크기', () => {
        it('자연수가 아닌 숫자 ', async () => {
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
          expect(responseBody.path).toBe('/shorten-urls');
          expect(responseBody.message).toBe('자연수를 입력하세요');
        });
      });
    });

    describe('동시성 테스트', () => {
      it('페이지 번호 조건', async () => {
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

      it('페이지 번호와 페이지 크기 조건', async () => {
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
  });
});
