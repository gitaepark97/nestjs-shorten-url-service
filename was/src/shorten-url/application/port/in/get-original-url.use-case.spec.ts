import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { GetOriginalUrlService } from '../../service/get-original-url.service';
import { CommandShortenUrlPort } from '../out/command-shorten-url.port';
import { QueryShortenUrlPort } from '../out/qeury-shorten-url.port';
import { GetOriginalUrlUseCase } from './get-original-url.use-case';

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

  describe('execute', () => {
    describe('성공', () => {
      it('원본 URL 조회', async () => {
        // given
        const findShortenUrlByKeyMock = jest
          .spyOn(queryShortenUrlPort, 'findShortenUrlByKey')
          .mockImplementationOnce(async (shortenUrlKey) =>
            ShortenUrl.builder()
              .set('id', 'id')
              .set('key', shortenUrlKey)
              .set('originalUrl', 'https://www.google.com')
              .set('visitCount', 0)
              .set('createdAt', new Date())
              .set('updatedAt', new Date())
              .build(),
          );
        const increaseVisitCountMock = jest
          .spyOn(commandShortenUrlPort, 'increaseVisitCount')
          .mockResolvedValueOnce();

        const shortenUrlKey = 'shortenUrlKey';

        // when
        const result = await useCase.execute(shortenUrlKey);

        // then
        expect(result).toBe('https://www.google.com');

        expect(findShortenUrlByKeyMock).toHaveBeenCalledTimes(1);
        expect(increaseVisitCountMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('데이터 미존재', () => {
      it('존재하지 않는 단축 URL', async () => {
        // given
        const findShortenUrlByKeyMock = jest
          .spyOn(queryShortenUrlPort, 'findShortenUrlByKey')
          .mockResolvedValueOnce(null);
        const increaseVisitCountMock = jest
          .spyOn(commandShortenUrlPort, 'increaseVisitCount')
          .mockResolvedValueOnce();

        const shortenUrlKey = 'shortenUrlKey';

        // when
        expect(
          async () => await useCase.execute(shortenUrlKey),
        ).rejects.toThrow('등록된 단축 URL이 아닙니다.');
        // then

        expect(findShortenUrlByKeyMock).toHaveBeenCalledTimes(1);
        expect(increaseVisitCountMock).not.toHaveBeenCalled();
      });
    });
  });
});
