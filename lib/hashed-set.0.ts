// DONE

/** Wrapper around Map which exposes all Set methods but stores the original Key object in the Map value */
export class HashedSet<Key, Hash extends string | number | bigint> {
  #map: Map<Hash, Key>;
  constructor(
    public readonly hasher: (key: Key) => Hash,
    iterable?: Iterable<Key>,
    hashedIterable?: Iterable<[Hash, Key]>,
  ) {
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
  public difference(other: HashedSet<Key, Hash>) {
    return new HashedSet(this.hasher, undefined, this.#map.entries().filter(([hash]) => !other.#map.has(hash)));
  }
  public entries(): IteratorObject<[Key, Key]> {
    return this.#map.values().map((key) => [key, key]);
  }
  public forEach(callback: (value: Key, value2: Key, hashset: HashedSet<Key, Hash>) => void) {
    return this.#map.values().forEach((key) => callback(key, key, this));
  }
  public has(key: Key) {
    return this.#map.has(this.hasher(key));
  }
  public intersection(other: HashedSet<Key, Hash>) {
    return new HashedSet(this.hasher, undefined, this.#map.entries().filter(([hash]) => other.#map.has(hash)));
  }
  public isDisjointFrom(other: HashedSet<Key, Hash>) {
    return this.#map.keys().every((hash) => !other.#map.has(hash));
  }
  public isSubsetOf(other: HashedSet<Key, Hash>) {
    return this.#map.keys().every((hash) => other.#map.has(hash));
  }
  public isSupersetOf(other: HashedSet<Key, Hash>) {
    return other.#map.keys().every((hash) => this.#map.has(hash));
  }
  public keys(): IteratorObject<Key> {
    return this.#map.values();
  }
  public get size() {
    return this.#map.size;
  }
  public symetricDifference(other: HashedSet<Key, Hash>) {
    return new HashedSet(this.hasher, undefined, [
      ...this.#map.entries().filter(([hash]) => !other.#map.has(hash)),
      ...other.#map.entries().filter(([hash]) => !this.#map.has(hash)),
    ]);
  }
  public union(other: HashedSet<Key, Hash>) {
    return new HashedSet(this.hasher, undefined, [...this.#map.entries(), ...other.#map.entries()]);
  }
  public values(): IteratorObject<Key> {
    return this.#map.values();
  }
  public get internal() {
    return this.#map;
  }
}
