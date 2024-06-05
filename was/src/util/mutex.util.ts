export class Mutex {
  private isLocked = false;
  private waitQueue: (() => void)[] = [];

  async acquire(): Promise<void> {
    if (!this.isLocked) {
      this.isLocked = true;
      return;
    }

    return new Promise<void>((resolve) => {
      this.waitQueue.push(resolve);
    });
  }

  release(): void {
    if (this.waitQueue.length > 0) {
      const nextResolve = this.waitQueue.shift();
      if (nextResolve) {
        nextResolve();
      }
    } else {
      this.isLocked = false;
    }
  }
}
