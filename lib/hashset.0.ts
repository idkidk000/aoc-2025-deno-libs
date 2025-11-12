//TODO: bench. might be better to maintain a set of hashes for use in Set methods. or maybe not using sets and just filtering on other.has() has lower initial overhead
export class HashSet<Key, Hash extends string | number | bigint> {
  #map: Map<Hash, Key>;
  constructor(public readonly hasher: (key: Key) => Hash, iterable?: Iterable<Key>, hashedIterable?: Iterable<[Hash, Key]>) {
    this.#map = new Map<Hash, Key>(
      iterable ? [...iterable].map((key) => [hasher(key), key]) : hashedIterable ? hashedIterable : null,
    );
  }
  public add(key: Key) {
    this.#map.set(this.hasher(key), key);
    return this;
  }
  public delete(key: Key) {
    return this.#map.delete(this.hasher(key));
  }
  public clear() {
    return this.#map.clear();
  }
  public difference(other: HashSet<Key, Hash>) {
    return new HashSet(this.hasher, undefined, this.#map.entries().filter(([hash]) => !other.internal.has(hash)));
  }
  public entries(): IteratorObject<[Key, Key]> {
    return this.#map.values().map((key) => [key, key]);
  }
  public forEach(callback: (value: Key, value2: Key, hashset: HashSet<Key, Hash>) => void) {
    return this.#map.values().forEach((key) => callback(key, key, this));
  }
  public has(key: Key) {
    return this.#map.has(this.hasher(key));
  }
  public intersection(other: HashSet<Key, Hash>) {
    return new HashSet(this.hasher, undefined, this.#map.entries().filter(([hash]) => other.internal.has(hash)));
  }
  public isDisjointFrom(other: HashSet<Key, Hash>) {
    return new Set(this.#map.keys()).isDisjointFrom(new Set(other.internal.keys()));
  }
  public isSupersetOf(other: HashSet<Key, Hash>) {
    return new Set(this.#map.keys()).isSupersetOf(new Set(other.internal.keys()));
  }
  public keys(): IteratorObject<Key> {
    return this.#map.values();
  }
  public get size() {
    return this.#map.size;
  }
  public symetricDifference(other: HashSet<Key, Hash>) {
    return new HashSet(this.hasher, undefined, [
      ...this.#map.entries().filter(([hash]) => !other.internal.has(hash)),
      ...other.internal.entries().filter(([hash]) => !this.#map.has(hash)),
    ]);
  }
  public union(other: HashSet<Key, Hash>) {
    return new HashSet(this.hasher, undefined, [...this.#map.entries(), ...other.internal.entries()]);
  }
  public values(): IteratorObject<Key> {
    return this.#map.values();
  }
  public get internal() {
    return this.#map;
  }
}
