// DONE

import { inspect } from 'node:util';

export class Deque<Item> {
  #array: Item[];
  #front: number = 0;
  #back: number = 0;
  constructor(size: number);
  constructor(iterable: Iterable<Item>);
  constructor(param: number | Iterable<Item> = 1000) {
    if (typeof param === 'number') this.#array = new Array(param);
    else {
      const items = [...param];
      this.#array = new Array(items.length * 2);
      this.pushBack(...items);
    }
  }
  get length() {
    return (this.#array.length - this.#front + this.#back) % this.#array.length;
  }
  get size() {
    return this.#array.length;
  }
  get front() {
    return this.#front;
  }
  get back() {
    return this.#back;
  }
  get internal() {
    return this.#array;
  }
  get empty() {
    // we always grow when the array is filled so this cannot return a false positive
    return this.#front === this.#back;
  }
  popBack() {
    if (this.empty) return undefined;
    if (this.#back === 0) this.#back === this.#array.length - 1;
    else --this.#back;
    const value = this.#array[this.#back];
    delete this.#array[this.#back];
    return value;
  }
  popFront() {
    if (this.empty) return undefined;
    const value = this.#array[this.#front];
    delete this.#array[this.#front];
    if (this.#front === this.#array.length - 1) this.#front = 0;
    else ++this.#front;
    return value;
  }
  pushBack(...values: Item[]) {
    for (const value of values) {
      this.#array[this.#back] = value;
      if (this.#back === this.#array.length - 1) this.#back = 0;
      else ++this.#back;
      if (this.#front === this.#back) this.#grow();
    }
    return this;
  }
  pushFront(...values: Item[]) {
    for (const value of values.toReversed()) {
      if (this.#front === 0) this.#front = this.#array.length - 1;
      else --this.#front;
      if (this.#front === this.#back) this.#grow();
      this.#array[this.#front] = value;
    }
    return this;
  }
  #grow() {
    const array = new Array(this.#array.length * 2);
    for (let i = 0; i < this.#back; ++i) array[i] = this.#array[i];
    for (let i = this.#front; i < this.#array.length; ++i) array[i + this.#array.length] = this.#array[i];
    this.#front += this.#array.length;
    this.#array = array;
  }
  [inspect.custom]() {
    return {
      internal: this.internal,
      front: this.front,
      back: this.back,
      size: this.size,
      length: this.length,
      empty: this.empty,
    };
  }
}
