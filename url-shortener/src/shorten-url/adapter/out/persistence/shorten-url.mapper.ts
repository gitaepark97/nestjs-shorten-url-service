import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { ShortenUrlEntity } from './shorten-url.entity';

export abstract class ShortenUrlMapper {
  static entityToDomain(entity: ShortenUrlEntity): ShortenUrl {
    return ShortenUrl.builder()
      .set('id', String(entity._id))
      .set('key', entity.key)
      .set('originalUrl', entity.originalUrl)
      .set('visitCount', entity.visitCount)
      .set('createdAt', entity.createdAt)
      .set('updatedAt', entity.updatedAt)
      .build();
  }
}
