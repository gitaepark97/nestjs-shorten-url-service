export abstract class CommandCountPort {
  abstract findCountAndIncrease(): Promise<number>;
}
