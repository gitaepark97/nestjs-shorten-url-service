import { ShortenUrl } from 'src/shorten-url/domain/shorten-url';
import { ShortenUrlEntity } from '../entity/shorten-url.entity';

export abstract class ShortenUrlMapper {
  static entityToDomain(entity: ShortenUrlEntity): ShortenUrl {
    return ShortenUrl.builder()
      .set('key', entity.key)
      .set('originalUrl', entity.originalUrl)
      .set('visitCount', entity.visitCount)
      .set('createdAt', entity.createdAt)
      .set('updatedAt', entity.updatedAt)
      .build();
  }

  static entitiesToDomains(entities: ShortenUrlEntity[]): ShortenUrl[] {
    return entities.map((entity) => ShortenUrlMapper.entityToDomain(entity));
  }
}
