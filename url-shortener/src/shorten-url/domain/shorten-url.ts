import { Builder } from 'src/util/builder.util';

export class ShortenUrl {
  readonly id: string;
  readonly key: string;
  readonly originalUrl: string;
  readonly visitCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  static builder() {
    return new Builder(this);
  }
}
