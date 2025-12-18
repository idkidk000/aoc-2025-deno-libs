## Advent of Code 2025 Deno Libs

### [`AocArgParser`, `EcArgParser`](args.1.ts)

Challenge-specific implementations of the same abstract base class.

### [`BinaryHeap`](binary-heap.0.ts)

Binary heap with destructive and non-destructive iterators.

### [`Counter`, `BigCounter`](counter.1.ts), [`DefaultMap`](default-map.0.ts)

Trivial `Map` wrappers.

### [`Deque`](deque.0.ts)

Fast circular array.

### [`Grid`](grid.0.ts)

Advent of Code does seem to like them.

### [`HashedMap`](hashed-map.0.ts), [`HashedSet`](hashed-set.0.ts)

`Map` wrappers. Both require a `hasher` function. Hash is stored in the `Map`'s `key`. Original key is stored in the `Map`'s `value`. `HashedSet` reimplements all of `Set`s functionality but it can be slower.

### [`LinkedList`](linked-list.0.ts)

Double linked list with low overhead inserts and deletes.

### [`Logger`](logger.0.ts)

You will never guess.

### [`Mutex`, `Semaphore`](mutex.0.ts)

Simple mutex based on the functionality of `async-mutex`. `Semaphore` is a trivial `Mutex` wrapper.

### [`PackedMap`](packed-map.0.ts), [`PackedSet`](packed-set.0.ts)

Fast `Map` and `Set` wrappers. Both require `packer` and accept an optional `unpacker` function in order to retreive the original keys.

### [`Point2D`](point2d.0.ts), [`Point3D`](point3d.0.ts)

Also Advent of Code favourites. Class and type-only variants.
