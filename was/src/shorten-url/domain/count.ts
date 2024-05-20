import { CountService } from '../application/service/count.service';

export class Count {
  start: number = 0;
  current: number = 0;
  end: number = 0;

  isFinished() {
    return this.current === this.end;
  }

  increaseCurrentCount() {
    this.current++;
  }

  setCount(start: number) {
    this.start = start;
    this.current = this.start;
    this.end = this.start + CountService.COUNT_RANGE - 1;
  }
}
