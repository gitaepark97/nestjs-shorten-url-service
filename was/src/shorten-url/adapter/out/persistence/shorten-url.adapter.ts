import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommandShortenUrlPort } from 'src/shorten-url/application/port/out/command-shorten-url.port';
import { QueryShortenUrlPort } from 'src/shorten-url/application/port/out/qeury-shorten-url.port';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { ShortenUrlEntity } from './entity/shorten-url.entity';
import { ShortenUrlMapper } from './mapper/shorten-url.mapper';

@Injectable()
export class ShortenUrlAdapter
  implements QueryShortenUrlPort, CommandShortenUrlPort
{
  constructor(
    @InjectModel(ShortenUrlEntity.name)
    private readonly shortenUrlModel: Model<ShortenUrlEntity>,
  ) {}

  async findShortenUrlByKey(shortenUrlKey: string): Promise<ShortenUrl | null> {
    const shortenUrlEntity = await this.shortenUrlModel.findOne({
      key: shortenUrlKey,
    });
    return (
      shortenUrlEntity && ShortenUrlMapper.entityToDomain(shortenUrlEntity)
    );
  }

  async findShortenUrls(skip: number, limit: number): Promise<ShortenUrl[]> {
    const shortenUrlEntities = await this.shortenUrlModel
      .find()
      .skip(skip)
      .limit(limit);
    return ShortenUrlMapper.entitiesToDomains(shortenUrlEntities);
  }

  count(): Promise<number> {
    return this.shortenUrlModel.countDocuments();
  }

  async save(shortenUrl: ShortenUrl): Promise<ShortenUrl> {
    const shortenUrlEntity = new this.shortenUrlModel(shortenUrl);
    await shortenUrlEntity.save();
    return ShortenUrlMapper.entityToDomain(shortenUrlEntity);
  }

  async increaseVisitCount(shortenUrlId: string): Promise<void> {
    await this.shortenUrlModel.updateOne(
      { _id: shortenUrlId },
      { $inc: { visitCount: 1 } },
    );
  }
}
