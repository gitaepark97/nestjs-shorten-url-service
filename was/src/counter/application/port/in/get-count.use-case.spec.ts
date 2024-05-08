import { Test, TestingModule } from '@nestjs/testing';
import { GetCountService } from '../../service/get-count.service';
import { CommandCountPort } from '../out/command-count.port';
import { GetCountUseCase } from './get-count.use-case';

describe('GetCountUseCase', () => {
  let useCase: GetCountUseCase;
  let commandCountPort: CommandCountPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: GetCountUseCase, useClass: GetCountService },
        {
          provide: CommandCountPort,
          useValue: {
            findCountAndIncrease: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetCountUseCase>(GetCountUseCase);
    commandCountPort = module.get<CommandCountPort>(CommandCountPort);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('count 조회', async () => {
      // given
      const findCountAndIncreaseMock = jest
        .spyOn(commandCountPort, 'findCountAndIncrease')
        .mockResolvedValueOnce(0);

      // when
      const result = await useCase.execute();

      // then
      expect(result).toBe(0);

      expect(findCountAndIncreaseMock).toHaveBeenCalledTimes(1);
    });

    it('동시성 테스트', async () => {
      // given
      const findCountAndIncreaseMock = jest
        .spyOn(commandCountPort, 'findCountAndIncrease')
        .mockResolvedValue(0);

      // when
      const tryCount = 10;
      const results = await Promise.all(
        Array.from({ length: tryCount }, async () => useCase.execute()),
      );

      // then
      results.forEach((result) => {
        expect(result).toBe(0);
      });

      expect(findCountAndIncreaseMock).toHaveBeenCalledTimes(tryCount);
    });
  });
});
