export class Counter<Key> extends Map<Key, number> {
  // deno-lint-ignore constructor-super
  constructor(iterable?: Iterable<[Key, number]> | Iterable<Key>, public readonly starting = 0, public readonly defaultAdd = 1) {
    const items = [...iterable ?? []];
    if (items.length && Array.isArray(items[0]) && items[0].length === 2) super(items as [Key, number][]);
    else {
      super();
      if (items.length) { for (const item of items as Key[]) super.set(item, (super.get(item) ?? starting) + defaultAdd); }
    }
  }
  add(item: Key, count?: number): number {
    const value = (this.get(item) ?? this.starting) + (count ?? this.defaultAdd);
    this.set(item, value);
    return value;
  }
  sortedEntries(): [Key, number][] {
    return super.entries().toArray().toSorted(([, a], [, b]) => a - b);
  }
  top(): [Key, number] | undefined {
    return this.sortedEntries().at(-1);
  }
  bottom(): [Key, number] | undefined {
    return this.sortedEntries().at(0);
  }
  override forEach(callbackfn: (value: number, key: Key, counter: Counter<Key>) => void): void {
    return super.forEach((value, key) => callbackfn(value, key, this));
  }
}

export class BigCounter<Key> extends Map<Key, bigint> {
  // deno-lint-ignore constructor-super
  constructor(iterable?: Iterable<[Key, bigint]> | Iterable<Key>, public readonly starting = 0n, public readonly defaultAdd = 1n) {
    const items = [...iterable ?? []];
    if (items.length && Array.isArray(items[0]) && items[0].length === 2) super(items as [Key, bigint][]);
    else {
      super();
      if (items.length) { for (const item of items as Key[]) super.set(item, (super.get(item) ?? starting) + defaultAdd); }
    }
  }
  add(item: Key, count?: bigint): bigint {
    const value = (this.get(item) ?? this.starting) + (count ?? this.defaultAdd);
    this.set(item, value);
    return value;
  }
  sortedEntries(): [Key, bigint][] {
    return super.entries().toArray().toSorted(([, a], [, b]) => a < b ? -1 : a > b ? 1 : 0);
  }
  top(): [Key, bigint] | undefined {
    return this.sortedEntries().at(-1);
  }
  bottom(): [Key, bigint] | undefined {
    return this.sortedEntries().at(0);
  }
  override forEach(callbackfn: (value: bigint, key: Key, counter: BigCounter<Key>) => void): void {
    return super.forEach((value, key) => callbackfn(value, key, this));
  }
}
