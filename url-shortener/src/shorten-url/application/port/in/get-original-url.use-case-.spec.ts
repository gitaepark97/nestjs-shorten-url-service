import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { GetOriginalUrlService } from '../../service/get-original-url.service';
import { CommandShortenUrlPort } from '../out/command-shorten-url.port';
import { QueryShortenUrlPort } from '../out/query-shorten-url.port';
import { GetOriginalUrlUseCase } from './get-original-url.use-case';
import { GetOriginalUrlQuery } from './query/get-original-url.query';

describe('GetOriginalUrlUseCase', () => {
  let useCase: GetOriginalUrlUseCase;
  let queryShortenUrlPort: QueryShortenUrlPort;
  let commandShortenUrlPort: CommandShortenUrlPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: GetOriginalUrlUseCase, useClass: GetOriginalUrlService },
        {
          provide: QueryShortenUrlPort,
          useValue: {
            findShortenUrlByKey: jest.fn(),
          },
        },
        {
          provide: CommandShortenUrlPort,
          useValue: {
            save: jest.fn(),
            increaseVisitCount: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetOriginalUrlUseCase>(GetOriginalUrlUseCase);
    queryShortenUrlPort = module.get<QueryShortenUrlPort>(QueryShortenUrlPort);
    commandShortenUrlPort = module.get<CommandShortenUrlPort>(
      CommandShortenUrlPort,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('원본 URL 조회', async () => {
      // given
      const shortenUrlKey = 'shortenUrlKey';
      const originalUrl = 'https://www.google.com';
      const query = GetOriginalUrlQuery.builder()
        .set('shortenUrlKey', shortenUrlKey)
        .build();

      const findShortenUrlByKeyMock = jest
        .spyOn(queryShortenUrlPort, 'findShortenUrlByKey')
        .mockImplementationOnce(async (shortenUrlKey) =>
          ShortenUrl.builder()
            .set('key', shortenUrlKey)
            .set('originalUrl', originalUrl)
            .build(),
        );
      const increaseVisitCountMock = jest
        .spyOn(commandShortenUrlPort, 'increaseVisitCount')
        .mockResolvedValueOnce();

      // when
      const result = await useCase.execute(query);

      // then
      expect(result).toBe(originalUrl);

      expect(findShortenUrlByKeyMock).toHaveBeenCalledTimes(1);
      expect(increaseVisitCountMock).toHaveBeenCalledTimes(1);
    });
  });

  it('동시성 테스트', async () => {
    // given
    const shortenUrlKey = 'shortenUrlKey';
    const originalUrl = 'https://www.google.com';
    const query = GetOriginalUrlQuery.builder()
      .set('shortenUrlKey', shortenUrlKey)
      .build();

    const findShortenUrlByKeyMock = jest
      .spyOn(queryShortenUrlPort, 'findShortenUrlByKey')
      .mockImplementation(async (shortenUrlKey) =>
        ShortenUrl.builder()
          .set('key', shortenUrlKey)
          .set('originalUrl', originalUrl)
          .build(),
      );
    const increaseVisitCountMock = jest
      .spyOn(commandShortenUrlPort, 'increaseVisitCount')
      .mockResolvedValue();

    // when
    const tryCount = 10;
    const results = await Promise.all(
      Array.from({ length: tryCount }, () => useCase.execute(query)),
    );

    // then
    results.forEach((result) => {
      expect(result).toBe(originalUrl);
    });

    expect(findShortenUrlByKeyMock).toHaveBeenCalledTimes(tryCount);
    expect(increaseVisitCountMock).toHaveBeenCalledTimes(tryCount);
  });

  describe('존재하지 않는 데이터', () => {
    it('존재하지 않는 단축 URL', async () => {
      // given
      const shortenUrlKey = 'shortenUrlKey';
      const query = GetOriginalUrlQuery.builder()
        .set('shortenUrlKey', shortenUrlKey)
        .build();

      const findShortenUrlByKeyMock = jest
        .spyOn(queryShortenUrlPort, 'findShortenUrlByKey')
        .mockResolvedValueOnce(null);
      const increaseVisitCountMock = jest
        .spyOn(commandShortenUrlPort, 'increaseVisitCount')
        .mockResolvedValueOnce();

      // when
      expect(async () => await useCase.execute(query)).rejects.toThrow(
        '등록된 단축 URL이 아닙니다.',
      );
      // then

      expect(findShortenUrlByKeyMock).toHaveBeenCalledTimes(1);
      expect(increaseVisitCountMock).not.toHaveBeenCalled();
    });
  });
});
