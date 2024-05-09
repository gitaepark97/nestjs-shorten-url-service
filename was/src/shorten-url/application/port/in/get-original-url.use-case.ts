export abstract class GetOriginalUrlUseCase {
  abstract execute(shortenUrlKey: string): Promise<string>;
}
