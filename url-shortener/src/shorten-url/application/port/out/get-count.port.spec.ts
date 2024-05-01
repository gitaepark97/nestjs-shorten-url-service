import { Test, TestingModule } from '@nestjs/testing';
import { CommandCountPort } from 'src/counter/application/port/out/command-count.port';
import { GetCountService } from 'src/counter/application/service/get-count.service';
import { GetCountPort } from './get-count.port';

describe('GetCountUsePort', () => {
  let port: GetCountPort;
  let commandCountPort: CommandCountPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: GetCountPort, useClass: GetCountService },
        {
          provide: CommandCountPort,
          useValue: {
            findCountAndIncrease: jest.fn(),
          },
        },
      ],
    }).compile();

    port = module.get<GetCountPort>(GetCountPort);
    commandCountPort = module.get<CommandCountPort>(CommandCountPort);
  });

  it('should be defined', () => {
    expect(port).toBeDefined();
  });

  describe('execute', () => {
    it('count 조회', async () => {
      // given
      const findCountAndIncreaseMock = jest
        .spyOn(commandCountPort, 'findCountAndIncrease')
        .mockResolvedValueOnce(0);

      // when
      const result = await port.execute();

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
        Array.from({ length: tryCount }, async () => port.execute()),
      );

      // then
      results.forEach((result) => {
        expect(result).toBe(0);
      });

      expect(findCountAndIncreaseMock).toHaveBeenCalledTimes(tryCount);
    });
  });
});
