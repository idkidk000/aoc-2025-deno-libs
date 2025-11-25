import { inspect } from 'node:util';

/** Wrapper around Map which stores the original key as part of the Map's value, so there is no unpacking overhead */
// `implements Map<Key, Value>` is helpful to verify the shape of the class but it cannot actually be satisfied
export class HashedMap<Key, Value, Hash = string | number | bigint> {
  #map: Map<Hash, { key: Key; value: Value }>;
  constructor(public readonly hasher: (key: Key) => Hash, iterable?: Iterable<[Key, Value]>) {
    this.#map = new Map<Hash, { key: Key; value: Value }>(iterable ? [...iterable].map(([key, value]) => [hasher(key), { key, value }]) : null);
  }
  public clear() {
    return this.#map.clear();
  }
  public delete(key: Key) {
    return this.#map.delete(this.hasher(key));
  }
  public entries(): MapIterator<[Key, Value]> {
    return this.#map.values().map(({ key, value }) => [key, value]);
  }
  public forEach(callback: (value: Value, key: Key, HashedMap: HashedMap<Key, Value, Hash>) => void) {
    return this.#map.values().forEach(({ key, value }) => callback(value, key, this));
  }
  public get(key: Key) {
    return this.#map.get(this.hasher(key))?.value;
  }
  public has(key: Key) {
    return this.#map.has(this.hasher(key));
  }
  public keys(): MapIterator<Key> {
    return this.#map.values().map(({ key }) => key);
  }
  public set(key: Key, value: Value) {
    this.#map.set(this.hasher(key), { key, value });
    return this;
  }
  public get size() {
    return this.#map.size;
  }
  public values(): MapIterator<Value> {
    return this.#map.values().map(({ value }) => value);
  }
  public [Symbol.iterator]() {
    return this.entries();
  }
  public [inspect.custom]() {
    return this.entries().toArray();
  }
}
