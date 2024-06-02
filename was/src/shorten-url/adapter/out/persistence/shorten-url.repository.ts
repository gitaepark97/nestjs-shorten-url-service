export abstract class ShortenUrlRepository {
  abstract increaseVisitCountByKey(shortenUrlKey: string): Promise<void>;
}
