import { inspect } from 'node:util';

class ListItem<Item> {
  #prev: ListItem<Item> | null;
  #next: ListItem<Item> | null;
  /** **links are added in both directions** */
  constructor(public data: Item, prev: ListItem<Item> | null, next: ListItem<Item> | null) {
    if (prev instanceof ListItem && next instanceof ListItem && next === prev) throw new Error('prev and next are the same class instance');
    this.#prev = prev;
    if (prev instanceof ListItem) prev.#next = this;
    this.#next = next;
    if (next instanceof ListItem) next.#prev = this;
  }
  get prev() {
    return this.#prev;
  }
  get next() {
    return this.#next;
  }
  /** class is deliberately not exported so that this method is hard to get at from outside the module
   *
   * **links are added in both directions**
   * @param item the item to process
   * @param prev `undefined` for unchanged, `ListItem<Item> | null` to update
   * @param next `undefined` for unchanged, `ListItem<Item> | null` to update
   */
  static link<Item>(item: ListItem<Item>, prev: ListItem<Item> | null | undefined, next: ListItem<Item> | null | undefined): ListItem<Item> {
    if (prev instanceof ListItem && next instanceof ListItem && next === prev) throw new Error('prev and next are the same class instance');
    if (prev === item) throw new Error('prev and item are the same class instance');
    if (next === item) throw new Error('next and item are the same class instance');
    if (typeof prev !== 'undefined') {
      item.#prev = prev;
      if (prev instanceof ListItem) prev.#next = item;
    }
    if (typeof next !== 'undefined') {
      item.#next = next;
      if (next instanceof ListItem) next.#prev = item;
    }
    return item;
  }
  [inspect.custom]() {
    return {
      data: this.data,
      prev: this.#prev === null ? null : this.#prev.data,
      next: this.#next === null ? null : this.#next.data,
    };
  }
}

/** Low-overhead inserts and deletes */
export class LinkedList<Item> {
  #front: ListItem<Item> | null = null;
  #back: ListItem<Item> | null = null;
  #size = 0;
  constructor(iterable?: Iterable<Item>) {
    if (!iterable) return;
    let prev: ListItem<Item> | null = null;
    for (const data of iterable) {
      const current: ListItem<Item> = new ListItem<Item>(data, prev, null);
      if (prev === null) this.#front = current;
      ++this.#size;
      prev = current;
    }
    this.#back = prev;
  }
  get front(): ListItem<Item> | undefined {
    return this.#front ?? undefined;
  }
  get back(): ListItem<Item> | undefined {
    return this.#back ?? undefined;
  }
  get size(): number {
    return this.#size;
  }
  clear(): void {
    this.#front = null;
    this.#back = null;
    this.#size = 0;
  }
  pushBack(...data: Item[]): void {
    for (const value of data) {
      const item = new ListItem<Item>(value, this.#back, null);
      this.#back = item;
      if (this.#front === null) this.#front = item;
      ++this.#size;
    }
  }
  pushFront(...data: Item[]): void {
    for (const value of data) {
      const item = new ListItem<Item>(value, null, this.#front);
      this.#front = item;
      if (this.#back === null) this.#back = item;
      ++this.#size;
    }
  }
  popBack(): ListItem<Item> | undefined {
    if (this.#back === null) return;
    const item = this.#back;
    this.#back = item.prev;
    if (this.#back instanceof ListItem) ListItem.link(this.#back, undefined, null);
    if (this.#front === item) this.#front = null;
    --this.#size;
    if (this.#size < 0) throw new Error('size is < 0');
    if (this.#size > 0 && this.#front === null) throw new Error('size is > 0 but front is null');
    ListItem.link(item, null, null);
    return item;
  }
  popFront(): ListItem<Item> | undefined {
    if (this.#front === null) return;
    const item = this.#front;
    this.#front = item.next;
    if (this.#front instanceof ListItem) ListItem.link(this.#front, null, undefined);
    if (this.#back === item) this.#back = null;
    --this.#size;
    if (this.#size < 0) throw new Error('size is < 0');
    if (this.#size > 0 && this.#back === null) throw new Error('size is > 0 but back is null');
    ListItem.link(item, null, null);
    return item;
  }
  delete(item: ListItem<Item>): void {
    if (this.#front === item) this.#front = item.next;
    if (this.#back === item) this.#back = item.prev;
    if (item.prev !== null) ListItem.link(item.prev, undefined, item.next);
    else if (item.next !== null) ListItem.link(item.next, item.prev, undefined);
    ListItem.link(item, null, null);
    --this.#size;
  }
  insertBefore(ref: ListItem<Item>, data: Item): ListItem<Item> {
    const item = new ListItem<Item>(data, ref.prev, ref);
    if (this.#front === ref) this.#front = item;
    ++this.#size;
    return item;
  }
  insertAfter(ref: ListItem<Item>, data: Item): ListItem<Item> {
    const item = new ListItem<Item>(data, ref, ref.next);
    if (this.#back === ref) this.#back = item;
    ++this.#size;
    return item;
  }
  find(predicate: (item: ListItem<Item>) => boolean): ListItem<Item> | undefined {
    for (let item = this.#front; item !== null; item = item.next) if (predicate(item)) return item;
  }
  findLast(predicate: (item: ListItem<Item>) => boolean): ListItem<Item> | undefined {
    for (let item = this.#back; item !== null; item = item.prev) if (predicate(item)) return item;
  }
  some(callback: (item: ListItem<Item>) => boolean): boolean {
    for (let item = this.#front; item !== null; item = item.next) if (callback(item)) return true;
    return false;
  }
  every(callback: (item: ListItem<Item>) => boolean): boolean {
    for (let item = this.#front; item !== null; item = item.next) if (!callback(item)) return false;
    return true;
  }
  reduce<Accumulated>(reducer: (accumulator: Accumulated, item: ListItem<Item>) => Accumulated, initial: Accumulated): Accumulated {
    let accumulator = initial;
    for (let item = this.#front; item !== null; item = item.next) accumulator = reducer(accumulator, item);
    return accumulator;
  }
  *itemsFront(): Generator<Item, undefined, undefined> {
    for (let item = this.#front; item !== null; item = item.next) yield item.data;
  }
  *itemsBack(): Generator<Item, undefined, undefined> {
    for (let item = this.#back; item !== null; item = item.prev) yield item.data;
  }
  *entriesFront(): Generator<ListItem<Item>, undefined, undefined> {
    for (let item = this.#front; item !== null; item = item.next) yield item;
  }
  *entriesBack(): Generator<ListItem<Item>, undefined, undefined> {
    for (let item = this.#back; item !== null; item = item.prev) yield item;
  }
  [Symbol.iterator]() {
    return this.itemsFront();
  }
  [inspect.custom]() {
    return {
      front: this.#front,
      back: this.#back,
      size: this.#size,
    };
  }
}
