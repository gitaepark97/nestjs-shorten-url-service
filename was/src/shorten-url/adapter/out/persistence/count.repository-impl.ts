import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoadAndUpdateCountPort } from 'src/shorten-url/application/port/out/load-and-update-count.port';
import { CountEntity } from './entity/count.entity';

@Injectable()
export class CountRepositoryImpl implements LoadAndUpdateCountPort {
  constructor(
    @InjectModel(CountEntity.name)
    private readonly countModel: Model<CountEntity>,
  ) {}

  async findCountAndIncrease(increase: number): Promise<number> {
    const count = await this.countModel.findOneAndUpdate(
      {},
      { $inc: { current: increase } },
    );

    return count!.current;
  }
}
