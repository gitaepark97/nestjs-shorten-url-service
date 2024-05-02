import { Builder } from 'src/util/builder.util';

export class GetShortenUrlsQuery {
  readonly page: number;
  readonly pageSize: number;

  static builder() {
    return new Builder(this);
  }
}
