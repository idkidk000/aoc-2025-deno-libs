// this is just a copy paste from last year
// TODO: fix up

import { inspect } from 'node:util';

export class Deque<Item> {
  #array: Item[];
  #front: number = 0;
  #back: number = 0;
  #size: number;
  constructor(length: number);
  constructor(iterable: Iterable<Item>);
  constructor(param: number | Iterable<Item> = 1000) {
    if (typeof param === 'number') {
      this.#size = param;
      this.#array = new Array(this.#size);
    } else {
      const items = [...param];
      this.#size = items.length * 2;
      this.#array = new Array(this.#size);
      this.pushBack(...param);
    }
  }
  get length() {
    return (this.#size - this.#front + this.#back) % this.#size;
  }
  get empty() {
    return this.#front === this.#back;
  }
  popBack() {
    if (this.empty) return undefined;
    this.#back = (this.#back - 1 + this.#size) % this.#size;
    const value = this.#array[this.#back];
    delete this.#array[this.#back];
    return value;
  }
  popFront() {
    if (this.empty) return undefined;
    const value = this.#array[this.#front];
    delete this.#array[this.#front];
    this.#front = (this.#front + 1) % this.#size;
    return value;
  }
  pushBack(...values: Item[]) {
    for (const value of values) {
      this.#array[this.#back] = value;
      this.#back = (this.#back + 1) % this.#size;
      if (this.#front === this.#back) this.#grow();
    }
    return this;
  }
  pushFront(...values: Item[]) {
    for (const value of values.toReversed()) {
      this.#front = (this.#front - 1 + this.#size) % this.#size;
      if (this.#front === this.#back) this.#grow();
      this.#array[this.#front] = value;
    }
    return this;
  }
  #grow() {
    const growBy = this.#size;
    const array = new Array(this.#size + growBy);
    for (let i = 0; i < this.#back; ++i) array[i] = this.#array[i];
    for (let i = this.#front; i < this.#size; ++i) array[i + growBy] = this.#array[i];
    this.#array = array;
    this.#front += growBy;
    this.#size += growBy;
  }
  [inspect.custom]() {
    return {
      internal: this.#array,
      front: this.#front,
      back: this.#back,
      size: this.#size,
      length: this.length,
    };
  }
}
