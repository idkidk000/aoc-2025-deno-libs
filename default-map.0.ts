export class DefaultMap<Key, Value> extends Map<Key, Value> {
  constructor(public readonly defaultValue: () => Value, iterable?: Iterable<[Key, Value]>) {
    super(iterable ?? null);
  }
  override get(key: Key): Value {
    const value = super.get(key);
    if (typeof value !== 'undefined') return value;
    const next = this.defaultValue();
    super.set(key, next);
    return next;
  }
}
