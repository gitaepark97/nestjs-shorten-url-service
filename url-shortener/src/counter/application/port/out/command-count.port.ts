export abstract class CommandCountPort {
  abstract findOneAndIncrease(): Promise<number>;
}
