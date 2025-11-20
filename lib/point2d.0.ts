export type Point2DTuple = [x: number, y: number];
export interface Point2DLike {
  x: number;
  y: number;
}
export interface Bounds2D {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const OFFSETS_4: Point2DTuple[] = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const OFFSETS_8: Point2DTuple[] = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
const INT64_MASK = (1n << 64n) - 1n;

// these all refer to the same area in memory
const float64Array = new Float64Array(2);
// used in `pack` and `unpack`
const bigUint64Array = new BigUint64Array(float64Array.buffer);
// // used in `hash`
const uint16Array = new Uint16Array(float64Array.buffer);
// const uint8Array = new Uint8Array(float64Array.buffer);

/** Classes have a performance penalty so all class methods are also available statically for `Point2DLike` objects */
export class Point2D implements Point2DLike {
  public x: number;
  public y: number;
  constructor(x: number, y: number);
  constructor(value: Point2DLike);
  constructor(value: Point2DTuple);
  constructor(a: number | Point2DLike | Point2DTuple, b?: number) {
    if (typeof a === 'number' && typeof b === 'number') [this.x, this.y] = [a, b];
    else if (Array.isArray(a)) [this.x, this.y] = a;
    else if (typeof a === 'object') [this.x, this.y] = [a.x, a.y];
    else throw new Error('invalid constructor params');
  }

  // convenience wrappers of static methods
  public add(other: Point2DLike): Point2D {
    return new Point2D(Point2D.add(this, other));
  }
  public sub(other: Point2DLike): Point2D {
    return new Point2D(Point2D.sub(this, other));
  }
  public mult(other: Point2DLike): Point2D;
  public mult(value: number): Point2D;
  public mult(other: Point2DLike | number): Point2D {
    // @ts-expect-error shush
    return new Point2D(Point2D.mult(this, other));
  }
  public eq(other: Point2DLike): boolean {
    return Point2D.eq(this, other);
  }
  /** Sum of squared x and y distances */
  public dist2(other: Point2DLike): number {
    return Point2D.dist2(this, other);
  }
  public dist(other: Point2DLike): number {
    return Point2D.dist(this, other);
  }
  public dists(other: Point2DLike, abs = false): Point2DLike {
    return Point2D.dists(this, other, abs);
  }
  /** Sum of x and y distances */
  public manhattan(other: Point2DLike): number {
    return Point2D.manhattan(this, other);
  }
  /** Max of x and y distances */
  public chebyshev(other: Point2DLike): number {
    return Point2D.chebyshev(this, other);
  }
  public *neighbours(count: 4 | 8): Generator<Point2D, void, void> {
    for (const neighbour of Point2D.neighbours(this, count)) yield new Point2D(neighbour);
  }
  public angle(other: Point2DLike): number {
    return Point2D.angle(this, other);
  }

  // static versions of class methods
  public static add(value: Point2DLike, other: Point2DLike): Point2DLike {
    return { x: other.x + value.x, y: other.y + value.y };
  }
  public static sub(value: Point2DLike, other: Point2DLike): Point2DLike {
    return { x: other.x - value.x, y: other.y - value.y };
  }
  public static mult(value: Point2DLike, other: Point2DLike): Point2DLike;
  public static mult(value: Point2DLike, multiplier: number): Point2DLike;
  public static mult(value: Point2DLike, other: Point2DLike | number): Point2DLike {
    return typeof other === 'number' ? { x: other * value.x, y: other * value.y } : { x: other.x * value.x, y: other.y * value.y };
  }
  public static eq(value: Point2DLike, other: Point2DLike): boolean {
    return other.x === value.x && other.y === value.y;
  }
  /** Sum of squared x and y distances */
  public static dist2(value: Point2DLike, other: Point2DLike): number {
    return (other.x - value.x) ** 2 + (other.y - value.y) ** 2;
  }
  public static dist(value: Point2DLike, other: Point2DLike): number {
    return Math.sqrt(Point2D.dist2(value, other));
  }
  public static dists(value: Point2DLike, other: Point2DLike, abs = false): Point2DLike {
    return abs ? { x: Math.abs(other.x - value.x), y: Math.abs(other.y = value.y) } : { x: other.x - value.x, y: (other.y = value.y) };
  }
  /** Sum of x and y distances */
  public static manhattan(value: Point2DLike, other: Point2DLike): number {
    return Math.abs(other.x - value.x) + Math.abs(other.y - value.y);
  }
  /** Max of x and y distances */
  public static chebyshev(value: Point2DLike, other: Point2DLike): number {
    return Math.max(Math.abs(other.x - value.x), Math.abs(other.y - value.y));
  }
  public static *neighbours(value: Point2DLike, count: 4 | 8): Generator<Point2DLike, void, void> {
    if (count === 4) { for (const [x, y] of OFFSETS_4) yield Point2D.add(value, { x, y }); }
    else if (count === 8) { for (const [x, y] of OFFSETS_8) yield Point2D.add(value, { x, y }); }
    else { throw new Error('invalid neighbour count'); }
  }
  public static angle(value: Point2DLike, other: Point2DLike): number {
    return Math.atan2(other.y - value.y, other.x - value.x);
  }

  // static utilities
  public static get offsets4(): Point2DLike[] {
    return OFFSETS_4.map(([x, y]) => ({ x, y }));
  }
  public static get offsets8(): Point2DLike[] {
    return OFFSETS_8.map(([x, y]) => ({ x, y }));
  }
  public static bounds(iterable: Iterable<Point2DLike>): Bounds2D {
    const items = [...iterable];
    return items.length
      ? items.reduce(
        (acc, item) => ({
          minX: Math.min(acc.minX, item.x),
          maxX: Math.max(acc.maxX, item.x),
          minY: Math.min(acc.minY, item.y),
          maxY: Math.max(acc.maxY, item.y),
        }),
        { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
      )
      : { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }
  /** Read x and y (Float64) as Int64 using shared buffers and combine into an Int128 (bigint can have arbitrary width)
   *
   * Use `makeSmallIntPacker()` for small integers
   */
  public static pack(value: Point2DLike): bigint {
    float64Array[0] = value.x;
    float64Array[1] = value.y;
    const [x, y] = bigUint64Array;
    return (x << 64n) | y;
  }
  public static unpack(value: bigint): Point2DLike {
    bigUint64Array[0] = value >> 64n;
    bigUint64Array[1] = value & INT64_MASK;
    const [x, y] = float64Array;
    return { x, y };
  }
  public static makeInBounds({ minX, maxX, minY, maxY }: Bounds2D) {
    return function (value: Point2DLike) {
      return value.x >= minX && value.x <= maxX && value.y >= minY && value.y <= maxY;
    };
  }
  /** These are faster than the `pack` and `unpack` static methods but only handle small integers */
  public static makeSmallIntPacker({ minX, maxX, minY, maxY }: Bounds2D) {
    // a bigint version of this is no faster than `pack` and `unpack` static methods and is still restricted to integers
    const widthY = Math.ceil(Math.log2(maxY - minY + 1));
    const maskY = (1 << widthY) - 1;
    function packUnsafe(value: Point2DLike): number {
      return ((value.x - minX) << widthY) | (value.y - minY);
    }
    function unpackUnsafe(value: number): Point2DLike {
      return { x: (value >> widthY) + minX, y: (value & maskY) + minY };
    }
    return {
      packUnsafe,
      /** throws on non-integer and oob */
      pack(value: Point2DLike) {
        if (!(Number.isInteger(value.x) && Number.isInteger(value.y) && value.x >= minX && value.x <= maxX && value.y >= minY && value.y <= maxY))
          throw new Error('only in-bounds integers can be packed');
        return packUnsafe(value);
      },
      unpackUnsafe,
      /** throws on negative, non-integer, and >MAX_SAFE_INTEGER */
      unpack(value: number) {
        if (value < 0 || !Number.isSafeInteger(value)) throw new Error('only safe positive integers can be unpacked');
        return unpackUnsafe(value);
      },
    };
  }
  /** Similar performance to small int packer, handles floats
   *
   * Collision rates are quite poor at 0.125% for small ints and 0.012% for floats and large ints
   *
   * `pack` is guaranteed to have 0% collisions and the output is reversible, but bigints are slow
   */
  public static hash(value: Point2DLike): number {
    const ix = Math.trunc(value.x);
    const iy = Math.trunc(value.y);
    const fx = (value.x - ix) * 1_000_000_000;
    const fy = (value.y - iy) * 1_000_000_000;
    return ix ^ (iy * 0xc2b2ae35) ^ (fx * 0x85ebca6b) ^ (fy * 0xe6546b64);
  }
  /** this gives 0.013% collisions on small ints, 0.0005% on small floats, and 0% (over 10mn runs) for everything else */
  public static hash2(value: Point2DLike): number {
    // make sure integers fill the address space instead of leaving mostly 0s
    float64Array[0] = value.x * Math.SQRT2;
    float64Array[1] = value.y * Math.PI;
    // this helps with small ints. not sure why since this is in the fractional part
    uint16Array[3] *= 13;
    // pack the two f64s into a single 64 bit space
    // reordering these increases collision rates
    uint16Array[0] ^= uint16Array[4];
    uint16Array[1] ^= uint16Array[5];
    uint16Array[2] ^= uint16Array[6];
    uint16Array[3] ^= uint16Array[7];
    return float64Array[0];
  }
  /** 0.004% for small ints, 0% for others. but the small int tests are expensive
   * actually this gets really bad again for ints -100k - 100k
   */
  public static hash3(value: Point2DLike): number {
    float64Array[0] = value.x * Math.SQRT2;
    float64Array[1] = value.y * Math.PI;

    // uint8Array[0] ^= uint8Array[8];
    // uint8Array[1] ^= uint8Array[9];
    // uint8Array[2] ^= uint8Array[10];
    // uint8Array[3] ^= uint8Array[11];
    // uint8Array[4] ^= uint8Array[12];
    // uint8Array[5] ^= uint8Array[13];
    // if (Number.isInteger(value.x) && Number.isInteger(value.y) && Math.abs(value.x) < 10_000 && Math.abs(value.y) < 10_000) {
    //   uint8Array[6] ^= uint8Array[15] ^ uint8Array[8];
    //   uint8Array[7] ^= uint8Array[14] ^ uint8Array[9];
    // } else {
    //   uint8Array[6] ^= uint8Array[14];
    //   uint8Array[7] ^= uint8Array[15];
    // }
    uint16Array[0] ^= uint16Array[4];
    uint16Array[1] ^= uint16Array[5];
    uint16Array[2] ^= uint16Array[6];
    // TODO: simplify the condition
    // if (Number.isInteger(value.x) && Number.isInteger(value.y) && Math.abs(value.x) < 10_000 && Math.abs(value.y) < 10_000) {
    //   // uint8Array[6] ^= uint8Array[15] ^ uint8Array[8];
    //   // uint8Array[7] ^= uint8Array[14] ^ uint8Array[9];
    //   uint16Array[3] ^= ((uint16Array[7] << 8) | (uint16Array[7] >> 8)) ^ uint16Array[4];
    // } else {
    //   uint16Array[3] ^= uint16Array[7];
    // }

    uint16Array[3] ^= Math.abs(value.x) < (1 << 30) && Math.abs(value.y) < (1 << 30) && Number.isInteger(value.x) && Number.isInteger(value.y)
      ? ((uint16Array[7] << 8) | (uint16Array[7] >> 8)) ^ uint16Array[4]
      : uint16Array[7];

    return float64Array[0];
  }
}
