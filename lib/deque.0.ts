import { inspect } from 'node:util';

// write then increment for pushBack, decrement then read for popBack
// decrement then write for pushFront, read then increment for popFront
// i.e. this.#back = writeable ix, this.#front = readable ix

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
  constructor(param: number | Iterable<Item> = 1024, { growthFactor = 2, deleteAfterPop = false }: { growthFactor?: number; deleteAfterPop?: boolean } = {}) {
    if (typeof param === 'number') this.#array = new Array(Math.max(param, 1));
    else {
      // push back
      const items = [...param];
      this.#array = new Array(Math.ceil(Math.max(items.length * growthFactor, 1)));
      for (const item of items) this.#array[this.#back++] = item;
    }
    this.#factor = growthFactor;
    this.#delete = deleteAfterPop;
  }
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
  public pushBack(...values: Item[]) {
    for (const value of values) {
      this.#array[this.#back] = value;
      if (this.#back === this.#array.length - 1) this.#back = 0;
      else ++this.#back;
      if (this.#front === this.#back) this.#grow();
    }
    return this.size;
  }
  public pushFront(value: Item) {
    if (this.#front === 0) this.#front = this.#array.length - 1;
    else --this.#front;
    this.#array[this.#front] = value;
    if (this.#front === this.#back) this.#grow();
  }
  public popBack(): Item | undefined {
    if (this.#front === this.#back) return;
    if (this.#back === 0) this.#back = this.#array.length - 1;
    else --this.#back;
    const value = this.#array[this.#back];
    if (this.#delete) delete this.#array[this.#back];
    return value;
  }
  public popFront(): Item | undefined {
    if (this.#front === this.#back) return;
    const value = this.#array[this.#front];
    if (this.#delete) delete this.#array[this.#front];
    if (this.#front === this.#array.length - 1) this.#front = 0;
    else ++this.#front;
    return value;
  }
  public at(index: number): Item | undefined {
    if (index >= 0) {
      if (index >= this.size) return;
      const intermediate = index + this.#front;
      return this.#array.at(intermediate < this.#array.length ? intermediate : intermediate - this.#array.length);
    }
    if (0 - index > this.size) return;
    const intermediate = this.#back + index;
    return this.#array.at(intermediate >= 0 ? intermediate : intermediate + this.#array.length);
  }
  public *itemsFront(): Generator<Item, void, void> {
    const size = this.size;
    for (let i = 0; i < size; ++i) {
      const intermediate = i + this.#front;
      yield this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length];
    }
  }
  public *itemsBack(): Generator<Item, void, void> {
    const size = this.size;
    for (let i = size - 1; i >= 0; --i) {
      const intermediate = i + this.#front;
      yield this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length];
    }
  }
  public *entriesFront(): Generator<[number, Item], void, void> {
    const size = this.size;
    for (let i = 0; i < size; ++i) {
      const intermediate = i + this.#front;
      yield [i, this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length]];
    }
  }
  public *entriesBack(): Generator<[number, Item], void, void> {
    const size = this.size;
    // undecided on whether i should be 0 to length-1 or length-1 to 0
    /* for (let i = size - 1; i >= 0; --i) {
      const intermediate = i + this.#front;
      yield [i, this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length]];
    } */
    for (let i = 0; i < size; ++i) {
      const intermediate = size - i - 1 + this.#front;
      yield [i, this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length]];
    }
  }
  public [Symbol.iterator]() {
    return this.itemsFront();
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
