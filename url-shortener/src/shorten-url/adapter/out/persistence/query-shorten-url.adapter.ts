import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { QueryShortenUrlPort } from 'src/shorten-url/application/port/out/query-shorten-url.port';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { ShortenUrlEntity } from './shorten-url.entity';
import { ShortenUrlMapper } from './shorten-url.mapper';

@Injectable()
export class QueryShortenUrlAdapter implements QueryShortenUrlPort {
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
}
