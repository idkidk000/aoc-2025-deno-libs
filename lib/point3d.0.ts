export type Point3DTuple = [x: number, y: number, z: number];
export interface Point3DLike {
  x: number;
  y: number;
  z: number;
}
export interface Bounds3D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

const OFFSETS_6: Point3DTuple[] = [[0, 0, -1], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0], [0, 0, 1]];
const OFFSETS_26: Point3DTuple[] = [
  [-1, -1, -1],
  [0, -1, -1],
  [1, -1, -1],
  [-1, 0, -1],
  [0, 0, -1],
  [1, 0, -1],
  [-1, 1, -1],
  [0, 1, -1],
  [1, 1, -1],
  [-1, -1, 0],
  [0, -1, 0],
  [1, -1, 0],
  [-1, 0, 0],
  [1, 0, 0],
  [-1, 1, 0],
  [0, 1, 0],
  [1, 1, 0],
  [-1, -1, 1],
  [0, -1, 1],
  [1, -1, 1],
  [-1, 0, 1],
  [0, 0, 1],
  [1, 0, 1],
  [-1, 1, 1],
  [0, 1, 1],
  [1, 1, 1],
];
const INT64_MASK = (1n << 64n) - 1n;

// these both refer to the same area in memory. preallocating and reusing is significantly faster than allocating and discarding on each call, but it's not async safe
const float64Array = new Float64Array(3);
const bigUint64Array = new BigUint64Array(float64Array.buffer);

/** Classes have a performance penalty so all class methods are also available statically for `Point3DLike` objects */
export class Point3D implements Point3DLike {
  public x: number;
  public y: number;
  public z: number;
  constructor(x: number, y: number, z: number);
  constructor(value: Point3DLike);
  constructor(value: Point3DTuple);
  constructor(a: number | Point3DLike | Point3DTuple, b?: number, c?: number) {
    if (typeof a === 'number' && typeof b === 'number' && typeof c === 'number') [this.x, this.y, this.z] = [a, b, c];
    else if (Array.isArray(a)) [this.x, this.y, this.z] = a;
    else if (typeof a === 'object') [this.x, this.y, this.z] = [a.x, a.y, a.z];
    else throw new Error('invalid constructor params');
  }

  // these just wrap the static methods to save code duplication
  public add(other: Point3DLike): Point3D {
    return new Point3D(Point3D.add(this, other));
  }
  public sub(other: Point3DLike): Point3D {
    return new Point3D(Point3D.sub(this, other));
  }
  public mult(other: Point3DLike): Point3D;
  public mult(value: number): Point3D;
  public mult(other: Point3DLike | number): Point3D {
    // @ts-expect-error shush
    return new Point3D(Point3D.mult(this, other));
  }
  public eq(other: Point3DLike): boolean {
    return Point3D.eq(this, other);
  }
  /** Sum of squared x and y distances */
  public dist2(other: Point3DLike): number {
    return Point3D.dist2(this, other);
  }
  public dist(other: Point3DLike): number {
    return Point3D.dist(this, other);
  }
  public dists(other: Point3D, abs = false): Point3DLike {
    return Point3D.dists(this, other, abs);
  }
  /** Sum of x, y, and z distances */
  public manhattan(other: Point3DLike): number {
    return Point3D.manhattan(this, other);
  }
  /** Max of x, y, and z distances */
  public chebyshev(other: Point3DLike): number {
    return Point3D.chebyshev(this, other);
  }
  public *neighbours(count: 6 | 26): Generator<Point3D, void, void> {
    for (const neighbour of Point3D.neighbours(this, count)) yield new Point3D(neighbour);
  }

  // static versions of class methods
  public static add(value: Point3DLike, other: Point3DLike): Point3DLike {
    return { x: other.x + value.x, y: other.y + value.y, z: other.z + value.z };
  }
  public static sub(value: Point3DLike, other: Point3DLike): Point3DLike {
    return { x: other.x - value.x, y: other.y - value.y, z: other.z - value.z };
  }
  public static mult(value: Point3DLike, other: Point3DLike): Point3DLike;
  public static mult(value: Point3DLike, multiplier: number): Point3DLike;
  public static mult(value: Point3DLike, other: Point3DLike | number): Point3DLike {
    return typeof other === 'number'
      ? { x: other * value.x, y: other * value.y, z: other * value.z }
      : { x: other.x * value.x, y: other.y * value.y, z: other.z * value.z };
  }
  public static eq(value: Point3DLike, other: Point3DLike): boolean {
    return other.x === value.x && other.y === value.y && other.z === value.z;
  }
  /** Sum of squared x and y distances */
  public static dist2(value: Point3DLike, other: Point3DLike): number {
    return (other.x - value.x) ** 2 + (other.y - value.y) ** 2 + (other.z - value.z) ** 2;
  }
  public static dist(value: Point3DLike, other: Point3DLike): number {
    return Math.sqrt(Point3D.dist2(value, other));
  }
  public static dists(value: Point3DLike, other: Point3DLike, abs = false): Point3DLike {
    return abs
      ? { x: Math.abs(other.x - value.x), y: Math.abs(other.y - value.y), z: Math.abs(other.z - value.z) }
      : { x: other.x - value.x, y: other.y - value.y, z: other.z - value.z };
  }
  /** Sum of x, y, and z distances */
  public static manhattan(value: Point3DLike, other: Point3DLike): number {
    return Math.abs(other.x - value.x) + Math.abs(other.y - value.y) + Math.abs(other.z - value.z);
  }
  /** Max of x, y, and z distances */
  public static chebyshev(value: Point3DLike, other: Point3DLike): number {
    return Math.max(Math.abs(other.x - value.x), Math.abs(other.y - value.y), Math.abs(other.z - value.z));
  }
  public static *neighbours(value: Point3DLike, count: 6 | 26): Generator<Point3DLike, void, void> {
    if (count === 6) { for (const [x, y, z] of OFFSETS_6) yield Point3D.add(value, { x, y, z }); }
    else if (count === 26) { for (const [x, y, z] of OFFSETS_26) yield Point3D.add(value, { x, y, z }); }
    else { throw new Error('invalid neighbour count'); }
  }

  // static utilities
  public static get offsets6(): Point3DLike[] {
    return OFFSETS_6.map(([x, y, z]) => ({ x, y, z }));
  }
  public static get offsets26(): Point3DLike[] {
    return OFFSETS_26.map(([x, y, z]) => ({ x, y, z }));
  }
  public static bounds(iterable: Iterable<Point3DLike>): Bounds3D {
    const items = [...iterable];
    return items.length
      ? items.reduce(
        (acc, item) => ({
          minX: Math.min(acc.minX, item.x),
          maxX: Math.max(acc.maxX, item.x),
          minY: Math.min(acc.minY, item.y),
          maxY: Math.max(acc.maxY, item.y),
          minZ: Math.min(acc.minZ, item.z),
          maxZ: Math.max(acc.maxZ, item.z),
        }),
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity, minZ: Infinity, maxZ: -Infinity },
      )
      : { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 };
  }
  /** Read x, y, and z (Float64) as Int64 using shared buffers and combine into an Int192 (bigint can have arbitrary width)
   *
   * Use `makeSmallIntPacker()` for small integers
   */
  public static pack(value: Point3DLike): bigint {
    float64Array[0] = value.x;
    float64Array[1] = value.y;
    float64Array[2] = value.z;
    const [x, y, z] = bigUint64Array;
    return (x << 128n) | (y << 64n) | z;
  }
  public static unpack(value: bigint): Point3DLike {
    bigUint64Array[0] = value >> 128n;
    bigUint64Array[1] = (value >> 64n) & INT64_MASK;
    bigUint64Array[2] = value & INT64_MASK;
    const [x, y, z] = float64Array;
    return { x, y, z };
  }
  public static makeInBounds({ minX, maxX, minY, maxY, minZ, maxZ }: Bounds3D) {
    return function (value: Point3DLike) {
      return value.x >= minX && value.x <= maxX && value.y >= minY && value.y <= maxY && value.z >= minZ && value.z <= maxZ;
    };
  }
  /** These are faster than the `pack` and `unpack` static methods but only handle small integers */
  public static makeSmallIntPacker({ minX, maxX, minY, maxY, minZ, maxZ }: Bounds3D) {
    // a bigint version of this is no faster than `pack` and `unpack` static methods and is still restricted to integers
    const widthY = Math.ceil(Math.log2(maxY - minY + 1));
    const maskY = (1 << widthY) - 1;
    const widthZ = Math.ceil(Math.log2(maxZ - minZ + 1));
    const maskZ = (1 << widthZ) - 1;
    function packUnsafe(value: Point3DLike): number {
      return ((value.x - minX) << (widthY + widthZ)) |
        ((value.y - minY) << widthZ) |
        (value.z - minZ);
    }
    function unpackUnsafe(value: number): Point3DLike {
      return { x: (value >> (widthY + widthZ)) + minX, y: ((value >> widthZ) & maskY) + minY, z: (value & maskZ) + minZ };
    }
    return {
      packUnsafe,
      /** throws on non-integer and oob */
      pack(value: Point3DLike) {
        if (
          !(
            Number.isInteger(value.x) &&
            Number.isInteger(value.y) &&
            Number.isInteger(value.z) &&
            value.x >= minX &&
            value.x <= maxX &&
            value.y >= minY &&
            value.y <= maxY &&
            value.z >= minZ &&
            value.z <= maxZ
          )
        ) {
          throw new Error('only in-bounds integers can be packed');
        }
        return packUnsafe(value);
      },
      unpackUnsafe,
      /** throws on negative, float, and >MAX_SAFE_INTEGER */
      unpack(value: number) {
        if (value < 0 || !Number.isSafeInteger(value)) throw new Error('only safe positive integers can be unpacked');
        return unpackUnsafe(value);
      },
    };
  }
}
