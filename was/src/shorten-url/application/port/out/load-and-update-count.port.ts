export abstract class LoadAndUpdateCountPort {
  abstract findCountAndIncrease(): Promise<number>;
}
