import { inspect } from 'node:util';

/** Wrapper around Set where key is passed though packer and unpacker functions
 *
 * Uses native `Set` methods for speed, but `HashedSet` might be a better choice if unpacking is slow
 */
// `implements Set<Key>` is helpful to verify the shape of the class but it cannot actually be satisfied
export class PackedSet<Key, Packed extends string | number | bigint> {
  #set: Set<Packed>;
  constructor(
    public readonly packer: (key: Key) => Packed,
    public readonly unpacker: (hash: Packed) => Key,
    iterable?: Iterable<Key>,
    packedIterable?: Iterable<Packed>,
  ) {
    this.#set = new Set<Packed>(
      iterable ? [...iterable].map(packer) : packedIterable ? packedIterable : null,
    );
  }
  public add(key: Key): this {
    this.#set.add(this.packer(key));
    return this;
  }
  public delete(key: Key): boolean {
    return this.#set.delete(this.packer(key));
  }
  public clear(): void {
    return this.#set.clear();
  }
  public difference(other: PackedSet<Key, Packed>): PackedSet<Key, Packed> {
    return new PackedSet(this.packer, this.unpacker, undefined, this.#set.difference(other.#set));
  }
  public entries(): SetIterator<[Key, Key]> {
    return this.#set.keys().map((packed) => {
      const key = this.unpacker(packed);
      return [key, key];
    });
  }
  public forEach(callback: (value: Key, value2: Key, packedSet: PackedSet<Key, Packed>) => void): void {
    return this.#set.keys().forEach((packed) => {
      const key = this.unpacker(packed);
      return callback(key, key, this);
    });
  }
  public has(key: Key): boolean {
    return this.#set.has(this.packer(key));
  }
  public intersection(other: PackedSet<Key, Packed>): PackedSet<Key, Packed> {
    return new PackedSet(this.packer, this.unpacker, undefined, this.#set.intersection(other.#set));
  }
  public isDisjointFrom(other: PackedSet<Key, Packed>): boolean {
    return this.#set.isDisjointFrom(other.#set);
  }
  public isSubsetOf(other: PackedSet<Key, Packed>): boolean {
    return this.#set.isSubsetOf(other.#set);
  }
  public isSupersetOf(other: PackedSet<Key, Packed>): boolean {
    return this.#set.isSupersetOf(other.#set);
  }
  public keys(): SetIterator<Key> {
    return this.#set.keys().map(this.unpacker);
  }
  public get size() {
    return this.#set.size;
  }
  public symmetricDifference(other: PackedSet<Key, Packed>): PackedSet<Key, Packed> {
    return new PackedSet(this.packer, this.unpacker, undefined, this.#set.symmetricDifference(other.#set));
  }
  public union(other: PackedSet<Key, Packed>): PackedSet<Key, Packed> {
    return new PackedSet(this.packer, this.unpacker, undefined, this.#set.union(other.#set));
  }
  public values(): SetIterator<Key> {
    return this.#set.keys().map(this.unpacker);
  }
  public [Symbol.iterator]() {
    return this.keys();
  }
  public [inspect.custom]() {
    return this.keys().toArray();
  }
}
