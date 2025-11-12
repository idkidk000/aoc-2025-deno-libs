// TODO: finish

export class Deque<Item> {
  #array: Item[];
  #front = 0;
  #back = 0;
  constructor(iterable: Iterable<Item>);
  constructor(initialSize: number);
  constructor(value: Iterable<Item> | number = 1000) {
    if (typeof value === 'number') this.#array = new Array(value);
    else {
      const items = [...value];
      this.#array = new Array(items.length * 2);
      items.forEach((item, i) => this.#array[i] = item);
      this.#back = items.length;
    }
  }
  #grow() {}
  public pushFront(...items: Item[]) {}
  public pushBack(...items: Item[]) {}
  public popFront(...items: Item[]) {}
  public popBack(...items: Item[]) {}
  public get length() {}
  public get internal() {
    return this.#array;
  }
}
