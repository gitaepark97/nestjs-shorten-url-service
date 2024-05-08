import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { GetShortenUrlsService } from '../../service/get-shorten-urls.service';
import { QueryShortenUrlPort } from '../out/query-shorten-url.port';
import { GetShortenUrlsUseCase } from './get-shorten-urls.use-case';
import { GetShortenUrlsQuery } from './query/get-shorten-urls.query';

describe('GetShortenUrlsUseCase', () => {
  let useCase: GetShortenUrlsUseCase;
  let queryShortenUrlPort: QueryShortenUrlPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: GetShortenUrlsUseCase, useClass: GetShortenUrlsService },
        {
          provide: QueryShortenUrlPort,
          useValue: {
            findShortenUrls: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetShortenUrlsUseCase>(GetShortenUrlsUseCase);
    queryShortenUrlPort = module.get<QueryShortenUrlPort>(QueryShortenUrlPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('단축 URL 목록 조회', async () => {
      // given
      const shortenUrlKey = 'shortenUrlKey';
      const originalUrl = 'https://www.google.com';
      const totalCount = 20;
      const pageNumber = 2;
      const pageSize = 5;
      const query = GetShortenUrlsQuery.builder()
        .set('pageNumber', pageNumber)
        .set('pageSize', pageSize)
        .build();

      const findShortenUrlsMock = jest
        .spyOn(queryShortenUrlPort, 'findShortenUrls')
        .mockImplementationOnce(async (_, limit) =>
          Array.from({ length: limit }, () =>
            ShortenUrl.builder()
              .set('id', 'id')
              .set('key', shortenUrlKey)
              .set('originalUrl', originalUrl)
              .set('visitCount', 0)
              .set('createdAt', new Date())
              .set('updatedAt', new Date())
              .build(),
          ),
        );
      const countMock = jest
        .spyOn(queryShortenUrlPort, 'count')
        .mockResolvedValueOnce(totalCount);

      // when
      const result = await useCase.execute(query);

      // then
      expect(result.shortenUrls.length).toBe(pageSize);
      result.shortenUrls.forEach((shortenUrl) => {
        expect(shortenUrl.id).toEqual(expect.any(String));
        expect(shortenUrl.key).toBe(shortenUrlKey);
        expect(shortenUrl.originalUrl).toBe(originalUrl);
        expect(shortenUrl.visitCount).toEqual(expect.any(Number));
        expect(shortenUrl.createdAt).toEqual(expect.any(Date));
        expect(shortenUrl.updatedAt).toEqual(expect.any(Date));
      });
      expect(result.totalCount).toBe(totalCount);

      expect(findShortenUrlsMock).toHaveBeenCalledTimes(1);
      expect(countMock).toHaveBeenCalledTimes(1);
    });
  });

  it('동시성 테스트', async () => {
    // given
    const shortenUrlKey = 'shortenUrlKey';
    const originalUrl = 'https://www.google.com';
    const totalCount = 20;
    const pageNumber = 2;
    const pageSize = 5;
    const query = GetShortenUrlsQuery.builder()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .build();

    const findShortenUrlsMock = jest
      .spyOn(queryShortenUrlPort, 'findShortenUrls')
      .mockImplementation(async (_, limit) =>
        Array.from({ length: limit }, () =>
          ShortenUrl.builder()
            .set('id', 'id')
            .set('key', shortenUrlKey)
            .set('originalUrl', originalUrl)
            .set('visitCount', 0)
            .set('createdAt', new Date())
            .set('updatedAt', new Date())
            .build(),
        ),
      );
    const countMock = jest
      .spyOn(queryShortenUrlPort, 'count')
      .mockResolvedValue(totalCount);

    // when
    const tryCount = 10;
    const results = await Promise.all(
      Array.from({ length: tryCount }, () => useCase.execute(query)),
    );

    // then
    results.forEach((result) => {
      expect(result.shortenUrls.length).toBe(pageSize);
      result.shortenUrls.forEach((shortenUrl) => {
        expect(shortenUrl.id).toEqual(expect.any(String));
        expect(shortenUrl.key).toBe(shortenUrlKey);
        expect(shortenUrl.originalUrl).toBe(originalUrl);
        expect(shortenUrl.visitCount).toEqual(expect.any(Number));
        expect(shortenUrl.createdAt).toEqual(expect.any(Date));
        expect(shortenUrl.updatedAt).toEqual(expect.any(Date));
      });
      expect(result.totalCount).toBe(totalCount);
    });

    expect(findShortenUrlsMock).toHaveBeenCalledTimes(tryCount);
    expect(countMock).toHaveBeenCalledTimes(tryCount);
  });
});
