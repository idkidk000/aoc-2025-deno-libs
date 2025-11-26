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

// these all refer to the same area in memory
// f64[2] is a scratch area for intermediate values
const float64Array = new Float64Array(3);
// used in `pack` and `unpack`
const bigUint64Array = new BigUint64Array(float64Array.buffer);
// used in `pack32` and `unpack32`
const float32Array = new Float32Array(float64Array.buffer);
// used in `hash`
const uint16Array = new Uint16Array(float64Array.buffer);

/** Classes have a performance penalty so all class methods are also available statically for `Point2DLike` objects */
export class Point2D implements Point2DLike {
  x: number;
  y: number;
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
  add(other: Point2DLike): Point2D {
    return new Point2D(Point2D.add(this, other));
  }
  sub(other: Point2DLike): Point2D {
    return new Point2D(Point2D.sub(this, other));
  }
  mult(other: Point2DLike): Point2D;
  mult(value: number): Point2D;
  mult(other: Point2DLike | number): Point2D {
    return new Point2D(Point2D.mult(this, other as Point2DLike));
  }
  eq(other: Point2DLike): boolean {
    return Point2D.eq(this, other);
  }
  /** Sum of squared x and y distances */
  dist2(other: Point2DLike): number {
    return Point2D.dist2(this, other);
  }
  dist(other: Point2DLike): number {
    return Point2D.dist(this, other);
  }
  dists(other: Point2DLike, abs = false): Point2DLike {
    return Point2D.dists(this, other, abs);
  }
  /** Sum of x and y distances */
  manhattan(other: Point2DLike): number {
    return Point2D.manhattan(this, other);
  }
  /** Max of x and y distances */
  chebyshev(other: Point2DLike): number {
    return Point2D.chebyshev(this, other);
  }
  *neighbours(count: 4 | 8): Generator<Point2D, void, void> {
    for (const neighbour of Point2D.neighbours(this, count)) yield new Point2D(neighbour);
  }
  angle(other: Point2DLike): number {
    return Point2D.angle(this, other);
  }

  // static versions of class methods
  static add(value: Point2DLike, other: Point2DLike): Point2DLike {
    return { x: other.x + value.x, y: other.y + value.y };
  }
  static sub(value: Point2DLike, other: Point2DLike): Point2DLike {
    return { x: other.x - value.x, y: other.y - value.y };
  }
  static mult(value: Point2DLike, other: Point2DLike): Point2DLike;
  static mult(value: Point2DLike, multiplier: number): Point2DLike;
  static mult(value: Point2DLike, other: Point2DLike | number): Point2DLike {
    return typeof other === 'number' ? { x: other * value.x, y: other * value.y } : { x: other.x * value.x, y: other.y * value.y };
  }
  static eq(value: Point2DLike, other: Point2DLike): boolean {
    return other.x === value.x && other.y === value.y;
  }
  /** Sum of squared x and y distances */
  static dist2(value: Point2DLike, other: Point2DLike): number {
    return (other.x - value.x) ** 2 + (other.y - value.y) ** 2;
  }
  static dist(value: Point2DLike, other: Point2DLike): number {
    return Math.sqrt(Point2D.dist2(value, other));
  }
  static dists(value: Point2DLike, other: Point2DLike, abs = false): Point2DLike {
    return abs ? { x: Math.abs(other.x - value.x), y: Math.abs(other.y = value.y) } : { x: other.x - value.x, y: (other.y = value.y) };
  }
  /** Sum of x and y distances */
  static manhattan(value: Point2DLike, other: Point2DLike): number {
    return Math.abs(other.x - value.x) + Math.abs(other.y - value.y);
  }
  /** Max of x and y distances */
  static chebyshev(value: Point2DLike, other: Point2DLike): number {
    return Math.max(Math.abs(other.x - value.x), Math.abs(other.y - value.y));
  }
  static *neighbours(value: Point2DLike, count: 4 | 8): Generator<Point2DLike, void, void> {
    if (count === 4) { for (const [x, y] of OFFSETS_4) yield Point2D.add(value, { x, y }); }
    else if (count === 8) { for (const [x, y] of OFFSETS_8) yield Point2D.add(value, { x, y }); }
    else { throw new Error('invalid neighbour count'); }
  }
  static angle(value: Point2DLike, other: Point2DLike): number {
    return Math.atan2(other.y - value.y, other.x - value.x);
  }

  // static utilities
  static get offsets4(): Point2DLike[] {
    return OFFSETS_4.map(([x, y]) => ({ x, y }));
  }
  static get offsets8(): Point2DLike[] {
    return OFFSETS_8.map(([x, y]) => ({ x, y }));
  }
  static getBounds(iterable: Iterable<Point2DLike>): Bounds2D {
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
  static makeInBounds({ minX, maxX, minY, maxY }: Bounds2D) {
    return function (value: Point2DLike) {
      return value.x >= minX && value.x <= maxX && value.y >= minY && value.y <= maxY;
    };
  }
  /** Lossless but slower than other `pack` and `hash` functions
   *
   * Use
   * - `pack32` for small numbers which can fit into f32
   * - `hash` if you just need to make a `Point2DLike` hashable
   *
   * **`Set` hates the output of this for small int inputs and will take 100x as long as you expect to process it** (22.9s vs 170ms). Maybe an alignment bug/misbehaviour in v8? Converting to a string first is faster
   * @returns 128-bit wide bigint */
  static pack(value: Point2DLike): bigint {
    float64Array[0] = value.x;
    float64Array[1] = value.y;
    const [x, y] = bigUint64Array;
    return (x << 64n) | y;
  }
  static unpack(value: bigint): Point2DLike {
    bigUint64Array[0] = value >> 64n;
    bigUint64Array[1] = value;
    const [x, y] = float64Array;
    return { x, y };
  }
  /** Much faster than `pack` and slightly faster than `hash`
   *
   * Only useful for small integers and small low-precision floats which can fit into f32 */
  static pack32(value: Point2DLike): number {
    // reading the array buffer as a bigUint64 also works but it's not as fast, and takes longer to add to a set
    float32Array[0] = value.x;
    float32Array[1] = value.y;
    return float64Array[0];
  }
  static unpack32(value: number): Point2DLike {
    float64Array[0] = value;
    const [x, y] = float32Array;
    return { x, y };
  }
  /** Much faster than `pack`, slightly slower than `pack32`
   *
   * 0% collisions on 10m unique clustered inputs each of small int, small float, large int, large float */
  static hash(value: Point2DLike): number {
    // fill out the significand. there's probably a better way to do this
    float64Array[0] = value.x * Math.LOG2E;
    float64Array[1] = value.y * Math.PI;

    // mix f64[0] (uint16[0-3]) and f64[1] (uint16[4-7]) into f64[2] (uint16[8-11])
    uint16Array[8] = uint16Array[0] ^ uint16Array[5] ^ (uint16Array[1] * 3) ^ (uint16Array[6] * 5);
    uint16Array[9] = uint16Array[1] ^ uint16Array[6] ^ (uint16Array[2] * 7) ^ (uint16Array[7] * 9);
    uint16Array[10] = uint16Array[2] ^ uint16Array[7] ^ (uint16Array[3] * 11) ^ (uint16Array[4] * 13);
    uint16Array[11] = uint16Array[3] ^ uint16Array[4] ^ (uint16Array[0] * 15) ^ (uint16Array[5] * 17);

    // if all the exponent bits are on, the entire f64 is invalid and NaN is returned.
    // https://en.wikipedia.org/wiki/Double-precision_floating-point_format
    // xor the top exponent bit somewhere else
    uint16Array[10] ^= uint16Array[11] & 0x4000;
    // then turn it off
    uint16Array[11] &= 0xbfff;
    return float64Array[2];
  }
}
