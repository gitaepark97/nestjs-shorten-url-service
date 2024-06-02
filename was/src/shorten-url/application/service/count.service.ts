export abstract class CountService {
  static readonly COUNT_RANGE = 10000;

  abstract getCurrentCount(): Promise<number>;
}
