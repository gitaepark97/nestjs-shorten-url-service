export abstract class LoadAndUpdateCountPort {
  abstract findCountAndIncrease(increase: number): Promise<number>;
}
