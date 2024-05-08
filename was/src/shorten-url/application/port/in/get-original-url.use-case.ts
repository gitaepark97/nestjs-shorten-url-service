import { GetOriginalUrlQuery } from './query/get-original-url.query';

export abstract class GetOriginalUrlUseCase {
  abstract execute(query: GetOriginalUrlQuery): Promise<string>;
}
