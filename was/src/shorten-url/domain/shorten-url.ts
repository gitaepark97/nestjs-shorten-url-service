import { Builder } from 'src/util/builder.util';

export class ShortenUrl {
  readonly key: string;
  readonly originalUrl: string;
  readonly visitCount: number = 0;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  static builder() {
    return new Builder(this);
  }
}
