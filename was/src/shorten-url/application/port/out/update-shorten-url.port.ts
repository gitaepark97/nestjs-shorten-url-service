export abstract class UpdateShortenUrlPort {
  abstract increaseVisitCountByKey(shortenUrlKey: string): Promise<void>;
}
