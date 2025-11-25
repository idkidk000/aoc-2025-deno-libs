export class Counter<Key, Value = number | bigint> extends Map<Key, Value> {
  constructor(public readonly starting: Value, public readonly defaultAdd: Value, iterable?: Iterable<[Key, Value]>) {
    super(iterable ? iterable : null);
  }
  public add(item: Key, count?: Value): Value {
    // @ts-expect-error actually operator + **can** be applied to types Value + Value
    const value = (this.get(item) ?? this.starting) + (count ?? this.defaultAdd);
    this.set(item, value);
    return value;
  }
  public override forEach(callbackfn: (value: Value, key: Key, counter: Counter<Key, Value>) => void): void {
    return super.forEach((value, key) => callbackfn(value, key, this));
  }
}
