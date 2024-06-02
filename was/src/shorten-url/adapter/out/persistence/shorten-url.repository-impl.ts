import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateShortenUrlPort } from 'src/shorten-url/application/port/out/create-shorten-url.port';
import { LoadShortenUrlPort } from 'src/shorten-url/application/port/out/load-shorten-url.port';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { ShortenUrlEntity } from './entity/shorten-url.entity';
import { ShortenUrlMapper } from './mapper/shorten-url.mapper';
import { ShortenUrlRepository } from './shorten-url.repository';

@Injectable()
export class ShortenUrlRepositoryImpl
  implements LoadShortenUrlPort, CreateShortenUrlPort, ShortenUrlRepository
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

  async createShortenUrl(shortenUrl: ShortenUrl): Promise<ShortenUrl> {
    const shortenUrlEntity = new this.shortenUrlModel(shortenUrl);
    await shortenUrlEntity.save();
    return ShortenUrlMapper.entityToDomain(shortenUrlEntity);
  }

  async increaseVisitCountByKey(shortenUrlKey: string): Promise<void> {
    await this.shortenUrlModel.updateOne(
      { key: shortenUrlKey },
      { $inc: { visitCount: 1 } },
    );
  }
}
