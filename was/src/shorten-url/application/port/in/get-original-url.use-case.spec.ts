import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { GetOriginalUrlServiceImpl } from '../../service/get-original-url.service';
import { CreateShortenUrlCachePort } from '../out/create-shorten-url-cache.port';
import { LoadShortenUrlCachePort } from '../out/load-shorten-url-cache.port';
import { LoadShortenUrlPort } from '../out/load-shorten-url.port';
import { UpdateShortenUrlPort } from '../out/update-shorten-url.port';
import { GetOriginalUrlUseCase } from './get-original-url.use-case';

describe('GetOriginalUrlUseCase', () => {
  let useCase: GetOriginalUrlUseCase;
  let loadShortenUrlCachePort: LoadShortenUrlCachePort;
  let createShortenUrlCachePort: CreateShortenUrlCachePort;
  let loadShortenUrlPort: LoadShortenUrlPort;
  let updateShortenUrlPort: UpdateShortenUrlPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: GetOriginalUrlUseCase, useClass: GetOriginalUrlServiceImpl },
        {
          provide: LoadShortenUrlCachePort,
          useValue: {
            findShortenUrlCache: jest.fn(),
          },
        },
        {
          provide: CreateShortenUrlCachePort,
          useValue: {
            createShortenUrlCache: jest.fn(),
          },
        },
        {
          provide: LoadShortenUrlPort,
          useValue: {
            findShortenUrlByKey: jest.fn(),
          },
        },
        {
          provide: UpdateShortenUrlPort,
          useValue: {
            increaseVisitCountByKey: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetOriginalUrlUseCase>(GetOriginalUrlUseCase);
    loadShortenUrlCachePort = module.get<LoadShortenUrlCachePort>(
      LoadShortenUrlCachePort,
    );
    createShortenUrlCachePort = module.get<CreateShortenUrlCachePort>(
      CreateShortenUrlCachePort,
    );
    loadShortenUrlPort = module.get<LoadShortenUrlPort>(LoadShortenUrlPort);
    updateShortenUrlPort =
      module.get<UpdateShortenUrlPort>(UpdateShortenUrlPort);
  });

  describe('execute', () => {
    describe('성공', () => {
      it('캐시 성공', async () => {
        // given
        const shortenUrl = ShortenUrl.builder()
          .set('key', 'shortenUrlKey')
          .set('originalUrl', 'https://www.google.com')
          .set('visitCount', 0)
          .set('createdAt', new Date())
          .set('updatedAt', new Date())
          .build();
        const findShortenUrlCacheMock = jest
          .spyOn(loadShortenUrlCachePort, 'findShortenUrlCache')
          .mockResolvedValueOnce(shortenUrl);
        const findShortenUrlByKeyMock = jest
          .spyOn(loadShortenUrlPort, 'findShortenUrlByKey')
          .mockResolvedValueOnce(shortenUrl);
        const createShortenUrlCacheMock = jest
          .spyOn(createShortenUrlCachePort, 'createShortenUrlCache')
          .mockResolvedValueOnce();
        const increaseVisitCountMock = jest
          .spyOn(updateShortenUrlPort, 'increaseVisitCountByKey')
          .mockResolvedValueOnce();

        const shortenUrlKey = 'shortenUrlKey';

        // when
        const result = await useCase.execute(shortenUrlKey);

        // then
        expect(result).toBe('https://www.google.com');

        expect(findShortenUrlCacheMock).toHaveBeenCalledTimes(1);
        expect(findShortenUrlByKeyMock).toHaveBeenCalledTimes(0);
        expect(createShortenUrlCacheMock).toHaveBeenCalledTimes(0);
        expect(increaseVisitCountMock).toHaveBeenCalledTimes(1);
      });

      it('캐시 실패', async () => {
        // given
        const shortenUrl = ShortenUrl.builder()
          .set('key', 'shortenUrlKey')
          .set('originalUrl', 'https://www.google.com')
          .set('visitCount', 0)
          .set('createdAt', new Date())
          .set('updatedAt', new Date())
          .build();
        const findShortenUrlCacheMock = jest
          .spyOn(loadShortenUrlCachePort, 'findShortenUrlCache')
          .mockResolvedValueOnce(null);
        const findShortenUrlByKeyMock = jest
          .spyOn(loadShortenUrlPort, 'findShortenUrlByKey')
          .mockResolvedValueOnce(shortenUrl);
        const createShortenUrlCacheMock = jest
          .spyOn(createShortenUrlCachePort, 'createShortenUrlCache')
          .mockResolvedValueOnce();
        const increaseVisitCountMock = jest
          .spyOn(updateShortenUrlPort, 'increaseVisitCountByKey')
          .mockResolvedValueOnce();

        const shortenUrlKey = 'shortenUrlKey';

        // when
        const result = await useCase.execute(shortenUrlKey);

        // then
        expect(result).toBe('https://www.google.com');

        expect(findShortenUrlCacheMock).toHaveBeenCalledTimes(1);
        expect(findShortenUrlByKeyMock).toHaveBeenCalledTimes(1);
        expect(createShortenUrlCacheMock).toHaveBeenCalledTimes(1);
        expect(increaseVisitCountMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('데이터 미존재', () => {
      it('존재하지 않는 단축 URL', async () => {
        // given
        const findShortenUrlCacheMock = jest
          .spyOn(loadShortenUrlCachePort, 'findShortenUrlCache')
          .mockResolvedValueOnce(null);
        const findShortenUrlByKeyMock = jest
          .spyOn(loadShortenUrlPort, 'findShortenUrlByKey')
          .mockResolvedValueOnce(null);
        const createShortenUrlCacheMock = jest
          .spyOn(createShortenUrlCachePort, 'createShortenUrlCache')
          .mockResolvedValueOnce();
        const increaseVisitCountMock = jest
          .spyOn(updateShortenUrlPort, 'increaseVisitCountByKey')
          .mockResolvedValueOnce();

        const shortenUrlKey = 'shortenUrlKey';

        // when
        await expect(() => useCase.execute(shortenUrlKey)).rejects.toThrow(
          '등록된 단축 URL이 아닙니다.',
        );
        // then

        expect(findShortenUrlCacheMock).toHaveBeenCalledTimes(1);
        expect(findShortenUrlByKeyMock).toHaveBeenCalledTimes(1);
        expect(createShortenUrlCacheMock).toHaveBeenCalledTimes(0);
        expect(increaseVisitCountMock).toHaveBeenCalledTimes(0);
      });
    });
  });
});
