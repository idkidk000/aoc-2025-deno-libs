export class DefaultMap<Key, Value> extends Map<Key, Value> {
  constructor(public readonly defaultValue: () => Value, iterable?: Iterable<[Key, Value]>) {
    super(iterable ?? null);
  }
  override get(key: Key): Value {
    if (!super.has(key)) {
      const value = this.defaultValue();
      super.set(key, value);
    }
    // deno-lint-ignore no-non-null-assertion
    return super.get(key)!;
  }
}
