import { Builder } from 'src/util/builder.util';

export class GetShortenUrlsQuery {
  readonly pageNumber: number;
  readonly pageSize: number;

  static builder() {
    return new Builder(this);
  }
}
