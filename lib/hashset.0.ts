export class HashSet<Key, Hash extends string | number | bigint> {
  #map: Map<Hash, Key>;
  constructor(public hasher: (key: Key) => Hash, iterable?: Iterable<Key>) {
    if (iterable) this.#map = new Map<Hash, Key>([...iterable].map((key) => [hasher(key), key]));
    else this.#map = new Map<Hash, Key>();
  }
  //TODO: add all set methods
}
