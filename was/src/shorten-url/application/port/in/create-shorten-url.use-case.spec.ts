import { Test, TestingModule } from '@nestjs/testing';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { CreateShortenUrlService } from '../../service/create-shorten-url.service';
import { CommandCountPort } from '../out/command-count.port';
import { CommandShortenUrlPort } from '../out/command-shorten-url.port';
import { CreateShortenUrlCommand } from './command/create-shorten-url.command';
import { CreateShortenUrlUseCase } from './create-shorten-url.use-case';

describe('CreateShortenUrlUseCase', () => {
  let useCase: CreateShortenUrlUseCase;
  let commandCountPort: CommandCountPort;
  let commandShortenUrlPort: CommandShortenUrlPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: CreateShortenUrlUseCase, useClass: CreateShortenUrlService },
        {
          provide: CommandCountPort,
          useValue: {
            findCountAndIncrease: jest.fn(),
          },
        },
        {
          provide: CommandShortenUrlPort,
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateShortenUrlUseCase>(CreateShortenUrlUseCase);
    commandCountPort = module.get<CommandCountPort>(CommandCountPort);
    commandShortenUrlPort = module.get<CommandShortenUrlPort>(
      CommandShortenUrlPort,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('단축 URL 생성', async () => {
      // given
      const originalUrl = 'https://www.google.com';
      const command = CreateShortenUrlCommand.builder()
        .set('originalUrl', originalUrl)
        .build();

      const executeMock = jest
        .spyOn(commandCountPort, 'findCountAndIncrease')
        .mockResolvedValueOnce(0);
      const saveMock = jest
        .spyOn(commandShortenUrlPort, 'save')
        .mockImplementationOnce(async (shortenUrl) =>
          ShortenUrl.builder()
            .set('id', `id`)
            .set('key', shortenUrl.key)
            .set('originalUrl', shortenUrl.originalUrl)
            .set('visitCount', shortenUrl.visitCount)
            .set('createdAt', new Date())
            .set('updatedAt', new Date())
            .build(),
        );

      // when
      const result = await useCase.execute(command);

      // then
      expect(result.id).toEqual(expect.any(String));
      expect(result.key).toEqual(expect.any(String));
      expect(result.key.length).toBe(7);
      expect(result.originalUrl).toBe(command.originalUrl);
      expect(result.visitCount).toBe(0);
      expect(result.createdAt).toEqual(expect.any(Date));
      expect(result.updatedAt).toEqual(expect.any(Date));

      expect(executeMock).toHaveBeenCalledTimes(1);
      expect(saveMock).toHaveBeenCalledTimes(1);
    });
  });

  it('동일한 원본 URL로부터 2개의 단축 URL 생성', async () => {
    // given
    const originalUrl = 'https://www.google.com';
    const command = CreateShortenUrlCommand.builder()
      .set('originalUrl', originalUrl)
      .build();

    const executeMock = jest
      .spyOn(commandCountPort, 'findCountAndIncrease')
      .mockResolvedValueOnce(0);
    jest
      .spyOn(commandCountPort, 'findCountAndIncrease')
      .mockResolvedValueOnce(1);
    const saveMock = jest
      .spyOn(commandShortenUrlPort, 'save')
      .mockImplementation(async (shortenUrl) =>
        ShortenUrl.builder()
          .set('id', `id`)
          .set('key', shortenUrl.key)
          .set('originalUrl', shortenUrl.originalUrl)
          .set('visitCount', shortenUrl.visitCount)
          .set('createdAt', new Date())
          .set('updatedAt', new Date())
          .build(),
      );

    // when
    const result1 = await useCase.execute(command);
    const result2 = await useCase.execute(command);

    // then
    expect(result1.key).not.toBe(result2.key);

    expect(executeMock).toHaveBeenCalledTimes(2);
    expect(saveMock).toHaveBeenCalledTimes(2);
  });

  it('동시성 테스트', async () => {
    // given
    const originalUrl = 'https://www.google.com';
    const command = CreateShortenUrlCommand.builder()
      .set('originalUrl', originalUrl)
      .build();

    const executeMock = jest
      .spyOn(commandCountPort, 'findCountAndIncrease')
      .mockResolvedValue(0);
    const saveMock = jest
      .spyOn(commandShortenUrlPort, 'save')
      .mockImplementation(async (shortenUrl) =>
        ShortenUrl.builder()
          .set('id', `id`)
          .set('key', shortenUrl.key)
          .set('originalUrl', shortenUrl.originalUrl)
          .set('visitCount', shortenUrl.visitCount)
          .set('createdAt', new Date())
          .set('updatedAt', new Date())
          .build(),
      );

    // when
    const tryCount = 10;
    const results = await Promise.all(
      Array.from({ length: tryCount }, () => useCase.execute(command)),
    );

    // then
    results.forEach((result) => {
      expect(result.id).toEqual(expect.any(String));
      expect(result.key).toEqual(expect.any(String));
      expect(result.key.length).toBe(7);
      expect(result.originalUrl).toBe(command.originalUrl);
      expect(result.visitCount).toBe(0);
      expect(result.createdAt).toEqual(expect.any(Date));
      expect(result.updatedAt).toEqual(expect.any(Date));
    });

    expect(executeMock).toHaveBeenCalledTimes(tryCount);
    expect(saveMock).toHaveBeenCalledTimes(tryCount);
  });
});
