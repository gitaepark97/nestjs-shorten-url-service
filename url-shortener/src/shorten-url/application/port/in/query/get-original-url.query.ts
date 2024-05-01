import { Builder } from 'src/util/builder.util';

export class GetOriginalUrlQuery {
  readonly shortenUrlKey: string;

  static builder() {
    return new Builder(this);
  }
}
