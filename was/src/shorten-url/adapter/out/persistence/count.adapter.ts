import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoadAndUpdateCountPort } from 'src/shorten-url/application/port/out/load-and-update-count.port';
import { Mutex } from 'src/util/mutex.util';
import { CountEntity } from './entity/count.entity';

@Injectable()
export class CountAdapter implements LoadAndUpdateCountPort {
  static COUNT_RANGE = 10000;

  private mutex = new Mutex();
  private count = {
    first: 0,
    current: 0,
    end: 0,
  };

  constructor(
    @InjectModel(CountEntity.name)
    private readonly countModel: Model<CountEntity>,
  ) {}

  async findCountAndIncrease(): Promise<number> {
    await this.mutex.acquire();
    try {
      if (this.count.current === this.count.end) {
        await this.setCount();
      } else {
        this.count.current++;
      }
    } finally {
      this.mutex.release();
    }

    return this.count.current;
  }

  private async setCount() {
    const count = await this.countModel.findOneAndUpdate(
      {},
      { $inc: { current: CountAdapter.COUNT_RANGE } },
    );
    this.count.first = count!.current;
    this.count.current = this.count.first;
    this.count.end = this.count.first + CountAdapter.COUNT_RANGE - 1;
  }
}
