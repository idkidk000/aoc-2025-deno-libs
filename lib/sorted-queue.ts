// this is just a copy paste from last year
// TODO: fix up

export class SortedQueue<Item> {
  #array: Item[] = [];
  constructor(public readonly comparator: (a: Item, b: Item) => number) {}
  get size() {
    return this.#array.length;
  }
  get empty() {
    return this.#array.length === 0;
  }
  pop() {
    if (this.empty) return undefined;
    const front = this.#array[0];
    // deno-lint-ignore no-non-null-assertion
    const back = this.#array.pop()!;
    if (this.size > 0) {
      this.#array[0] = back;
      this.#siftDown();
    }
    return front;
  }
  push(...values: Item[]): this {
    for (const value of values) {
      this.#array.push(value);
      this.#siftUp();
    }
    return this;
  }
  #siftDown() {
    let itemIx = 0;
    const item = this.#array[0];
    while (true) {
      const leftIx = 2 * itemIx + 1;
      const rightIx = 2 * itemIx + 2;
      let swapIx = -1;
      if (leftIx < this.#array.length && this.comparator(this.#array[leftIx], item) < 0) swapIx = leftIx;
      if (rightIx < this.#array.length && this.comparator(this.#array[rightIx], this.#array[swapIx === -1 ? itemIx : leftIx]) < 0)
        swapIx = rightIx;
      if (swapIx === -1) break;
      this.#array[itemIx] = this.#array[swapIx];
      itemIx = swapIx;
    }
    this.#array[itemIx] = item;
  }
  #siftUp() {
    let itemIx = this.size - 1;
    const item = this.#array[itemIx];
    while (itemIx > 0) {
      const parentIx = Math.floor((itemIx - 1) / 2);
      const parent = this.#array[parentIx];
      if (this.comparator(item, parent) >= 0) break;
      this.#array[itemIx] = parent;
      itemIx = parentIx;
    }
    this.#array[itemIx] = item;
  }
}
