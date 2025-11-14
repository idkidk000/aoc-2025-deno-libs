// DONE

/** Wrapper around Set where key is passed though packer and unpacker functions
 *
 * `HashedSet` might be a better choice if unpacking is slow
 */
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
  public add(key: Key) {
    this.#set.add(this.packer(key));
    return this;
  }
  public delete(key: Key) {
    return this.#set.delete(this.packer(key));
  }
  public clear() {
    return this.#set.clear();
  }
  public difference(other: PackedSet<Key, Packed>) {
    return new PackedSet(this.packer, this.unpacker, undefined, this.#set.difference(other.#set));
  }
  public entries(): IteratorObject<[Key, Key]> {
    return this.#set.keys().map((packed) => {
      const key = this.unpacker(packed);
      return [key, key];
    });
  }
  public forEach(callback: (value: Key, value2: Key, hashset: PackedSet<Key, Packed>) => void) {
    return this.#set.keys().forEach((packed) => {
      const key = this.unpacker(packed);
      return callback(key, key, this);
    });
  }
  public has(key: Key) {
    return this.#set.has(this.packer(key));
  }
  public intersection(other: PackedSet<Key, Packed>) {
    return new PackedSet(this.packer, this.unpacker, undefined, this.#set.intersection(other.#set));
  }
  public isDisjointFrom(other: PackedSet<Key, Packed>) {
    return this.#set.isDisjointFrom(other.#set);
  }
  public isSubsetOf(other: PackedSet<Key, Packed>) {
    return this.#set.isSubsetOf(other.#set);
  }
  public isSupersetOf(other: PackedSet<Key, Packed>) {
    this.#set.isSupersetOf(other.#set);
  }
  public keys(): IteratorObject<Key> {
    return this.#set.keys().map(this.unpacker);
  }
  public get size() {
    return this.#set.size;
  }
  public symetricDifference(other: PackedSet<Key, Packed>) {
    return new PackedSet(this.packer, this.unpacker, undefined, this.#set.symmetricDifference(other.#set));
  }
  public union(other: PackedSet<Key, Packed>) {
    return new PackedSet(this.packer, this.unpacker, undefined, this.#set.union(other.#set));
  }
  public values(): IteratorObject<Key> {
    return this.#set.keys().map(this.unpacker);
  }
  public get internal() {
    return this.#set;
  }
}
