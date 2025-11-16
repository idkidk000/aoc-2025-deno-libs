import { inspect } from 'node:util';

// write then increment for pushBack, decrement then read for popBack
// decrement then write for pushFront, read then increment for popFront

/** Basic circular array since native Array `shift` and `unshift` are very slow  */
export class Deque<Item> {
  #array: Item[];
  #front = 0;
  #back = 0;
  #factor: number;
  #delete: boolean;
  /** Lower growth factor is better for ram but higher is better for performance
   *
   * Delete after pop is more correct and should help with gc but hurts performance
   */
  constructor(length?: number, params?: { growthFactor?: number; deleteAfterPop?: boolean });
  constructor(iterable: Iterable<Item>, params?: { growthFactor?: number; deleteAfterPop?: boolean });
  constructor(a: number | Iterable<Item> = 1024, { growthFactor = 2, deleteAfterPop = false }: { growthFactor?: number; deleteAfterPop?: boolean } = {}) {
    if (typeof a === 'number') this.#array = new Array(Math.max(a, 1));
    else {
      const items = [...a];
      this.#array = new Array(Math.ceil(Math.max(items.length * growthFactor, 1)));
      for (const item of items) this.#array[this.#back++] = item;
    }
    this.#factor = growthFactor;
    this.#delete = deleteAfterPop;
  }
  // /** internal array length */
  // public get length() {
  //   return this.#array.length;
  // }
  /** apparent length */
  public get size() {
    if (this.#front === this.#back) return 0;
    if (this.#front > this.#back) return this.#array.length - this.#front + this.#back;
    return this.#back - this.#front;
  }
  #grow() {
    const array = new Array(Math.ceil(this.#array.length * this.#factor));
    for (let destIx = 0; destIx < this.#array.length; ++destIx) {
      const intermediate = destIx + this.#back;
      array[destIx] = this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length];
    }
    this.#front = 0;
    this.#back = this.#array.length;
    this.#array = array;
  }
  public pushBack(value: Item) {
    this.#array[this.#back] = value;
    if (this.#back === this.#array.length - 1) this.#back = 0;
    else ++this.#back;
    if (this.#front === this.#back) this.#grow();
  }
  public pushFront(value: Item) {
    if (this.#front === 0) this.#front = this.#array.length - 1;
    else --this.#front;
    this.#array[this.#front] = value;
    if (this.#front === this.#back) this.#grow();
  }
  public popBack(): Item | void {
    if (this.#front === this.#back) return;
    if (this.#back === 0) this.#back = this.#array.length - 1;
    else --this.#back;
    const value = this.#array[this.#back];
    if (this.#delete) delete this.#array[this.#back];
    return value;
  }
  public popFront(): Item | void {
    if (this.#front === this.#back) return;
    const value = this.#array[this.#front];
    if (this.#delete) delete this.#array[this.#front];
    if (this.#front === this.#array.length - 1) this.#front = 0;
    else ++this.#front;
    return value;
  }
  public [inspect.custom]() {
    return {
      internal: this.#array,
      front: this.#front,
      back: this.#back,
      length: this.#array.length,
      size: this.size,
    };
  }
}
