import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { CreateShortenUrlService } from '../../service/create-shorten-url.service';
import { CreateShortenUrlPort } from '../out/create-shorten-url.port';
import { LoadAndUpdateCountPort } from '../out/load-and-update-count.port';
import { CreateShortenUrlCommand } from './command/create-shorten-url.command';
import { CreateShortenUrlUseCase } from './create-shorten-url.use-case';

describe('CreateShortenUrlUseCase', () => {
  let useCase: CreateShortenUrlUseCase;
  let loadAndUpdateCountPort: LoadAndUpdateCountPort;
  let createShortenUrlPort: CreateShortenUrlPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: CreateShortenUrlUseCase, useClass: CreateShortenUrlService },
        {
          provide: LoadAndUpdateCountPort,
          useValue: {
            findCountAndIncrease: jest.fn(),
          },
        },
        {
          provide: CreateShortenUrlPort,
          useValue: {
            createShortenUrl: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateShortenUrlUseCase>(CreateShortenUrlUseCase);
    loadAndUpdateCountPort = module.get<LoadAndUpdateCountPort>(
      LoadAndUpdateCountPort,
    );
    createShortenUrlPort =
      module.get<CreateShortenUrlPort>(CreateShortenUrlPort);
  });

  describe('execute', () => {
    describe('성공', () => {
      it('단축 URL 생성', async () => {
        // given
        const executeMock = jest
          .spyOn(loadAndUpdateCountPort, 'findCountAndIncrease')
          .mockResolvedValueOnce(0);
        const saveMock = jest
          .spyOn(createShortenUrlPort, 'createShortenUrl')
          .mockImplementationOnce(async (shortenUrl) =>
            ShortenUrl.builder()
              .set('key', shortenUrl.key)
              .set('originalUrl', shortenUrl.originalUrl)
              .set('visitCount', shortenUrl.visitCount)
              .set('createdAt', new Date())
              .set('updatedAt', new Date())
              .build(),
          );

        const command = CreateShortenUrlCommand.builder()
          .set('originalUrl', 'https://www.google.com')
          .build();

        // when
        const result = await useCase.execute(command);

        // then
        expect(result.key).toEqual(expect.any(String));
        expect(result.key.length).toBe(7);
        expect(result.originalUrl).toBe(command.originalUrl);
        expect(result.visitCount).toBe(0);
        expect(result.createdAt).toEqual(expect.any(Date));
        expect(result.updatedAt).toEqual(expect.any(Date));

        expect(executeMock).toHaveBeenCalledTimes(1);
        expect(saveMock).toHaveBeenCalledTimes(1);
      });

      it('동일한 원본 URL로부터 2개의 단축 URL 생성', async () => {
        // given

        const executeMock = jest
          .spyOn(loadAndUpdateCountPort, 'findCountAndIncrease')
          .mockResolvedValueOnce(0);
        jest
          .spyOn(loadAndUpdateCountPort, 'findCountAndIncrease')
          .mockResolvedValueOnce(1);
        const saveMock = jest
          .spyOn(createShortenUrlPort, 'createShortenUrl')
          .mockImplementation(async (shortenUrl) =>
            ShortenUrl.builder()
              .set('key', shortenUrl.key)
              .set('originalUrl', shortenUrl.originalUrl)
              .set('visitCount', shortenUrl.visitCount)
              .set('createdAt', new Date())
              .set('updatedAt', new Date())
              .build(),
          );

        const command = CreateShortenUrlCommand.builder()
          .set('originalUrl', 'https://www.google.com')
          .build();

        // when
        const result1 = await useCase.execute(command);
        const result2 = await useCase.execute(command);

        // then
        expect(result1.key).not.toBe(result2.key);

        expect(executeMock).toHaveBeenCalledTimes(2);
        expect(saveMock).toHaveBeenCalledTimes(2);
      });
    });
  });
});
