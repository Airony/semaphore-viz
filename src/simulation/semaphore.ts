/** A waiter blocked on P() */
interface Waiter {
  processId: string;
  resolve: () => void;
}

/**
 * Promise-based semaphore that faithfully implements P/V semantics.
 * P() blocks (returns a Promise) when value <= 0.
 * V() increments and wakes the oldest waiter from the FIFO queue.
 */
export class Semaphore {
  private _value: number;
  private _queue: Waiter[] = [];
  private _name: string;

  constructor(initialValue: number, name: string) {
    this._value = initialValue;
    this._name = name;
  }

  get value(): number {
    return this._value;
  }

  get name(): string {
    return this._name;
  }

  /** Returns the list of processIds currently blocked on this semaphore */
  get waiters(): string[] {
    return this._queue.map(w => w.processId);
  }

  /** P (wait/acquire). Blocks if value <= 0. */
  async P(processId: string): Promise<void> {
    if (this._value > 0) {
      this._value--;
      return;
    }
    // Block: create a promise that will be resolved by V()
    return new Promise<void>((resolve) => {
      this._queue.push({ processId, resolve });
    });
  }

  /** V (signal/release). Increments value; if waiters exist, wake the oldest. */
  V(): void {
    if (this._queue.length > 0) {
      // Wake the first waiter — value stays at 0 (transfer ownership)
      const waiter = this._queue.shift()!;
      waiter.resolve();
    } else {
      this._value++;
    }
  }

  /** Hard reset — clears all waiters (they will never resolve) */
  reset(initialValue: number): void {
    this._value = initialValue;
    this._queue = [];
  }
}
