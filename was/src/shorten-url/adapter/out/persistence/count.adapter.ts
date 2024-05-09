import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommandCountPort } from 'src/shorten-url/application/port/out/command-count.port';
import { CountEntity } from './entity/count.entity';

@Injectable()
export class CountAdapter implements CommandCountPort {
  constructor(
    @InjectModel(CountEntity.name)
    private readonly countModel: Model<CountEntity>,
  ) {}

  async findCountAndIncrease(): Promise<number> {
    const count = await this.countModel.findOneAndUpdate(
      {},
      { $inc: { current: 1 } },
    );
    return count!.current;
  }
}
