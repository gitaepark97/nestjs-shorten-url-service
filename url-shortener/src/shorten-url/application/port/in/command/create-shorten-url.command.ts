import { Builder } from 'src/util/builder.util';

export class CreateShortenUrlCommand {
  readonly originalUrl: string;

  static builder() {
    return new Builder(this);
  }
}
