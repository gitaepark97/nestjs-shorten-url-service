import { Injectable } from '@nestjs/common';
import { Count } from 'src/shorten-url/domain/count';
import { Mutex } from 'src/util/mutex.util';
import { LoadAndUpdateCountPort } from '../port/out/load-and-update-count.port';

export abstract class CountService {
  static readonly COUNT_RANGE = 10000;

  abstract getCurrentCount(): Promise<number>;
}

@Injectable()
export class CountServiceImpl implements CountService {
  private mutex = new Mutex();
  private readonly count = new Count();

  constructor(
    private readonly loadAndUpdateCountPort: LoadAndUpdateCountPort,
  ) {}

  async getCurrentCount(): Promise<number> {
    await this.mutex.acquire();
    try {
      if (this.count.isFinished()) {
        const start = await this.loadAndUpdateCountPort.findCountAndIncrease(
          CountService.COUNT_RANGE,
        );
        this.count.setCount(start);
      } else {
        this.count.increaseCurrentCount();
      }
    } finally {
      this.mutex.release();
    }

    return this.count.current;
  }
}
