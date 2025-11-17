import { inspect } from 'node:util';

/** Wrapper around Map where key is passed though packer and unpacker functions
 *
 * `HashedMap` might be a better choice if unpacking is slow
 */
// `implements Map<Key, Value>` is helpful to verify the shape of the class but it cannot actually be satisfied
export class PackedMap<Key, Value, Packed extends string | number | bigint> {
  #map: Map<Packed, Value>;
  constructor(
    public readonly packer: (key: Key) => Packed,
    public readonly unpacker: (packed: Packed) => Key,
    iterable?: Iterable<[Key, Value]>,
  ) {
    this.#map = new Map<Packed, Value>(iterable ? [...iterable].map(([key, value]) => [packer(key), value]) : null);
  }
  public clear() {
    return this.#map.clear();
  }
  public delete(key: Key) {
    return this.#map.delete(this.packer(key));
  }
  public entries(): MapIterator<[Key, Value]> {
    return this.#map.entries().map(([packed, value]) => [this.unpacker(packed), value]);
  }
  public forEach(callback: (value: Value, key: Key, packedMap: PackedMap<Key, Value, Packed>) => void) {
    return this.#map.entries().forEach(([packed, value]) => callback(value, this.unpacker(packed), this));
  }
  public get(key: Key) {
    return this.#map.get(this.packer(key));
  }
  public has(key: Key) {
    return this.#map.has(this.packer(key));
  }
  public keys(): MapIterator<Key> {
    return this.#map.keys().map(this.unpacker);
  }
  public set(key: Key, value: Value) {
    this.#map.set(this.packer(key), value);
    return this;
  }
  public get size() {
    return this.#map.size;
  }
  public values(): MapIterator<Value> {
    return this.#map.values();
  }
  public [Symbol.iterator]() {
    return this.entries();
  }
  public [inspect.custom]() {
    return this.entries().toArray();
  }
}
