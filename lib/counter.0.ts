export class Counter<Item> extends Map<Item, number> {
  #initial: number;
  constructor(iterable?: Iterable<[Item, number]>, initial = 0) {
    super(iterable ? iterable : null);
    this.#initial = initial;
  }
  public add(item: Item, count = 1) {
    const value = ((this.get(item)) ?? this.#initial) + count;
    this.set(item, value);
    return value;
  }
  public sub(item: Item, count = 1) {
    return this.add(item, -count);
  }
}
