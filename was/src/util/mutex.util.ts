export class Mutex {
  private isLocked = false;
  private watiQueue: (() => void)[] = [];

  async acquire(): Promise<void> {
    if (!this.isLocked) {
      this.isLocked = true;
      return;
    }

    return new Promise<void>((resolve) => {
      this.watiQueue.push(resolve);
    });
  }

  release(): void {
    if (this.watiQueue.length > 0) {
      const nextResolve = this.watiQueue.shift();
      if (nextResolve) {
        nextResolve();
      }
    } else {
      this.isLocked = false;
    }
  }
}
