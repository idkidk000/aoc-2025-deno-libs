export class HashMap<Key, Value, Hash extends string | number | bigint> {
  #map: Map<Hash, { key: Key; value: Value }>;
  constructor(public hasher: (key: Key) => Hash, iterable?: Iterable<[Key, Value]>) {
    if (iterable) this.#map = new Map<Hash, { key: Key; value: Value }>([...iterable].map(([key, value]) => [hasher(key), { key, value }]));
    else this.#map = new Map<Hash, { key: Key; value: Value }>();
  }
  public clear() {
    return this.#map.clear();
  }
  public delete(key: Key) {
    return this.#map.delete(this.hasher(key));
  }
  public entries(): IteratorObject<[Key, Value]> {
    return this.#map.values().map(({ key, value }) => [key, value]);
  }
  public forEach(callback: (value: Value, key: Key, hashmap: HashMap<Key, Value, Hash>) => void) {
    this.#map.values().forEach(({ key, value }) => callback(value, key, this));
  }
  public get(key: Key) {
    return this.#map.get(this.hasher(key))?.value;
  }
  public has(key: Key) {
    return this.#map.has(this.hasher(key));
  }
  public keys(): IteratorObject<Key> {
    return this.#map.values().map(({ key }) => key);
  }
  public set(key: Key, value: Value) {
    this.#map.set(this.hasher(key), { key, value });
    return this;
  }
  public get size() {
    return this.#map.size;
  }
  public values(): IteratorObject<Value> {
    return this.#map.values().map(({ value }) => value);
  }
}
