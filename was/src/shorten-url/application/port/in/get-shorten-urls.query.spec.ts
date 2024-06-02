import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { GetShortenUrlsServiceImpl } from '../../service/get-shorten-urls.service-impl';
import { LoadShortenUrlPort } from '../out/load-shorten-url.port';
import { GetShortenUrlsUseCase } from './get-shorten-urls.use-case';

describe('GetShortenUrlsUseCase', () => {
  let useCase: GetShortenUrlsUseCase;
  let loadShortenUrlPort: LoadShortenUrlPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: GetShortenUrlsUseCase, useClass: GetShortenUrlsServiceImpl },
        {
          provide: LoadShortenUrlPort,
          useValue: {
            findShortenUrls: jest.fn(),
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetShortenUrlsUseCase>(GetShortenUrlsUseCase);
    loadShortenUrlPort = module.get<LoadShortenUrlPort>(LoadShortenUrlPort);
  });

  describe('execute', () => {
    describe('성공', () => {
      it('단축 URL 목록 조회', async () => {
        // given
        const shortenUrl = ShortenUrl.builder()
          .set('key', 'shortenUrlKey')
          .set('originalUrl', 'https://www.google.com')
          .set('visitCount', 0)
          .set('createdAt', new Date())
          .set('updatedAt', new Date())
          .build();

        const totalCount = 20;
        const findShortenUrlsMock = jest
          .spyOn(loadShortenUrlPort, 'findShortenUrls')
          .mockImplementationOnce(async (_, limit) =>
            Array.from({ length: limit }, () => shortenUrl),
          );
        const countMock = jest
          .spyOn(loadShortenUrlPort, 'count')
          .mockResolvedValueOnce(totalCount);

        const pageNumber = 2;
        const pageSize = 5;

        // when
        const result = await useCase.execute(pageNumber, pageSize);

        // then
        expect(result.shortenUrls.length).toBe(pageSize);
        result.shortenUrls.forEach((shortenUrl) => {
          expect(shortenUrl.key).toBe('shortenUrlKey');
          expect(shortenUrl.originalUrl).toBe('https://www.google.com');
          expect(shortenUrl.visitCount).toEqual(expect.any(Number));
          expect(shortenUrl.createdAt).toEqual(expect.any(Date));
          expect(shortenUrl.updatedAt).toEqual(expect.any(Date));
        });
        expect(result.totalCount).toBe(totalCount);

        expect(findShortenUrlsMock).toHaveBeenCalledTimes(1);
        expect(countMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
