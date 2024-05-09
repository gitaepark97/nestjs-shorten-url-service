export class Builder<T extends object> {
  private readonly temp: Partial<T> = {};

  constructor(private readonly model: new () => T) {}

  set<K extends keyof T>(key: K, value: T[K]): Builder<T> {
    this.temp[key] = value;
    return this;
  }

  build(): T {
    return Object.assign(new this.model(), this.temp) as T;
  }
}
