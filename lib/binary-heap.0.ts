// DONE

import { inspect } from 'node:util';

// https://en.wikipedia.org/wiki/Binary_heap
export class BinaryHeap<Item> {
  #array: Item[] = [];
  constructor(public readonly comparator: (a: Item, b: Item) => number) {}
  get length() {
    return this.#array.length;
  }
  get internal() {
    return this.#array;
  }
  push(...values: Item[]) {
    for (const value of values) {
      this.#array.push(value);
      let itemIx = this.#array.length - 1;
      while (itemIx > 0) {
        const parentIx = (itemIx - 1) >> 1;
        if (this.comparator(this.#array[itemIx], this.#array[parentIx]) >= 0) break;
        [this.#array[itemIx], this.#array[parentIx]] = [this.#array[parentIx], this.#array[itemIx]];
        itemIx = parentIx;
      }
    }
    return this;
  }
  pop() {
    if (this.#array.length === 0) return;
    const top = this.#array[0];
    // deno-lint-ignore no-non-null-assertion
    const last = this.#array.pop()!;
    if (this.#array.length) {
      this.#array[0] = last;
      let parentIx = 0;
      while (true) {
        const childAIx = parentIx * 2 + 1;
        const childBIx = parentIx * 2 + 2;
        let bestIx = parentIx;
        if (childAIx < this.#array.length && this.comparator(this.#array[childAIx], this.#array[bestIx]) < 0) bestIx = childAIx;
        if (childBIx < this.#array.length && this.comparator(this.#array[childBIx], this.#array[bestIx]) < 0) bestIx = childBIx;
        if (bestIx === parentIx) break;
        [this.#array[parentIx], this.#array[bestIx]] = [this.#array[bestIx], this.#array[parentIx]];
        parentIx = bestIx;
      }
    }
    return top;
  }
  [inspect.custom]() {
    return {
      internal: this.internal,
      length: this.length,
    };
  }
}
