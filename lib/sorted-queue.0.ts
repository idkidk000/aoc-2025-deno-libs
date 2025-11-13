// works but it's not quick

import { inspect } from 'node:util';

export class SortedQueue<Item> {
  #array: Item[] = [];
  // #ops = 0;
  // #pushed = 0;
  // #popped = 0;
  constructor(public readonly comparator: (a: Item, b: Item) => number) {}
  get length() {
    return this.#array.length;
  }
  get internal() {
    return this.#array;
  }
  // get stats() {
  //   return { pushed: this.#pushed, popped: this.#popped, ops: this.#ops };
  // }
  pop() {
    // popping is free. shifting isn't
    const value = this.#array.pop();
    // if (typeof value !== 'undefined') ++this.#popped;
    return value;
  }
  push(...values: Item[]) {
    for (const value of values) {
      let placeIx = this.#array.length;
      while (placeIx > 0) {
        const swapIx = placeIx - 1;
        const swap = this.#array[swapIx];
        // flip the comparator so we can pop the next item
        if (this.comparator(value, swap) <= 0) break;
        // keep shifting items until we find our insertion point
        this.#array[placeIx] = swap;
        placeIx = swapIx;
        // ++this.#ops;
      }
      // place the item
      this.#array[placeIx] = value;
      // ++this.#ops;
    }

    // this.#array = [...this.#array, ...values].toSorted((a, b) => 0 - this.comparator(a, b));

    //  this.#array.push(...values);
    //  this.#array.sort((a, b) => 0 - this.comparator(a, b));

    // this.#pushed += values.length;
    return this;
  }
  [inspect.custom]() {
    return {
      internal: this.internal,
      length: this.length,
      // pushed: this.#pushed,
      // popped: this.#popped,
      // ops: this.#ops,
    };
  }
}
