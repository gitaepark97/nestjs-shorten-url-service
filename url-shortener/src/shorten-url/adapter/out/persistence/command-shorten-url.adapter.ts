import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommandShortenUrlPort } from 'src/shorten-url/application/port/out/command-shorten-url.port';
import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { ShortenUrlEntity } from './shorten-url.entity';
import { ShortenUrlMapper } from './shorten-url.mapper';

@Injectable()
export class CommandShortenUrlAdapter implements CommandShortenUrlPort {
  constructor(
    @InjectModel(ShortenUrlEntity.name)
    private readonly shortenUrlModel: Model<ShortenUrlEntity>,
  ) {}

  async save(shortenUrl: ShortenUrl): Promise<ShortenUrl> {
    const shortenUrlEntity = new this.shortenUrlModel(shortenUrl);
    await shortenUrlEntity.save();
    return ShortenUrlMapper.entityToDomain(shortenUrlEntity);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  increaseVisitCount(shortenUrlId: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
