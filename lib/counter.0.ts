export class Counter<Item> extends Map<Item, number> {
  #initial: number;
  constructor(initial = 0) {
    super();
    this.#initial = initial;
  }
  public add(item: Item, count = 1) {
    const value = ((this.get(item)) ?? this.#initial) + count;
    this.set(item, value);
    return value;
  }
}
