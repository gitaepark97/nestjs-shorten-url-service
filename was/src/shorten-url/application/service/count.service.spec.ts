import { Test, TestingModule } from '@nestjs/testing';
import { LoadAndUpdateCountPort } from '../port/out/load-and-update-count.port';
import { CountService, CountServiceImpl } from './count.service';

describe('CountService', () => {
  let service: CountService;
  let loadAndUpdateCountPort: LoadAndUpdateCountPort;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CountService,
          useClass: CountServiceImpl,
        },
        {
          provide: LoadAndUpdateCountPort,
          useValue: {
            findCountAndIncrease: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CountService>(CountService);
    loadAndUpdateCountPort = module.get<LoadAndUpdateCountPort>(
      LoadAndUpdateCountPort,
    );
  });

  describe('execute', () => {
    describe('성공', () => {
      it('count 조회', async () => {
        // given
        const findCountAndIncreaseMock = jest
          .spyOn(loadAndUpdateCountPort, 'findCountAndIncrease')
          .mockResolvedValueOnce(0);

        // when
        const result = await service.getCurrentCount();

        // then
        expect(result).toBe(0);

        expect(findCountAndIncreaseMock).toHaveBeenCalledTimes(1);
      });
    });

    describe('동시성 테스트', () => {
      it('count 조회', async () => {
        // given
        const findCountAndIncreaseMock = jest
          .spyOn(loadAndUpdateCountPort, 'findCountAndIncrease')
          .mockResolvedValueOnce(0);

        // when
        const tryCount = 10;
        const results = await Promise.all(
          Array.from({ length: tryCount }, () => service.getCurrentCount()),
        );

        // then
        const visited = Array.from({ length: tryCount }, () => false);
        results.forEach((result) => {
          visited[result] = true;
        });

        visited.forEach((val) => expect(val).toBeTruthy());

        expect(findCountAndIncreaseMock).toHaveBeenCalledTimes(1);
      });
    });
  });
});
