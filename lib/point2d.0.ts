// DONE

export type XyTuple = [x: number, y: number];
export interface XyObject {
  x: number;
  y: number;
}
export interface XyBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

const OFFSETS_4: XyTuple[] = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const OFFSETS_8: XyTuple[] = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];
const INT64_MASK = (1n << 64n) - 1n;

// these both refer to the same area in memory. preallocating and reusing is significantly faster than allocating and discarding on each call, but it's not async safe
const float64Array = new Float64Array(2);
const bigUint64Array = new BigUint64Array(float64Array.buffer);

export class Point2D {
  constructor(public x: number, public y: number) {}
  public add(other: Point2D) {
    return new Point2D(this.x + other.x, this.y + other.y);
  }
  public sub(other: Point2D) {
    return new Point2D(this.x - other.x, this.y - other.y);
  }
  public mult(other: Point2D): Point2D;
  public mult(value: number): Point2D;
  public mult(other: Point2D | number) {
    return other instanceof Point2D ? new Point2D(this.x * other.x, this.y * other.y) : new Point2D(this.x * other, this.y * other);
  }
  public eq(other: Point2D) {
    return this.x === other.x && this.y === other.y;
  }
  /** Sum of squared x and y distances */
  public dist2(other: Point2D) {
    return (this.x - other.x) ** 2 + (this.y - other.y) ** 2;
  }
  public dist(other: Point2D) {
    return Math.sqrt(this.dist2(other));
  }
  /** Sum of x and y distances */
  public manhattan(other: Point2D) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }
  /** Max of x and y distances */
  public chebyshev(other: Point2D) {
    return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y));
  }
  public get xy(): XyObject {
    return { x: this.x, y: this.y };
  }
  public static get offsets4() {
    return OFFSETS_4.map(([x, y]) => new Point2D(x, y));
  }
  public static get offsets8() {
    return OFFSETS_8.map(([x, y]) => new Point2D(x, y));
  }
  public static bounds(iterable: Iterable<Point2D>): XyBounds {
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
  /** Read x and y (Float64) as Int64 using shared buffers and combine into an Int128
   *
   * Use `makeUtils().packSmallInt` for small integers
   */
  public static pack(value: Point2D) {
    float64Array[0] = value.x;
    float64Array[1] = value.y;
    const [x, y] = bigUint64Array;
    return (x << 64n) | y;
  }
  public static unpack(value: bigint) {
    bigUint64Array[0] = value >> 64n;
    bigUint64Array[1] = value & INT64_MASK;
    const [x, y] = float64Array;
    return new Point2D(x, y);
  }
  public static makeInBounds({ minX, maxX, minY, maxY }: XyBounds) {
    return function (value: Point2D) {
      return value.x >= minX && value.x <= maxX && value.y >= minY && value.y <= maxY;
    };
  }
  /** These utils are faster than the `pack` and `unpack` static methods but only handle small integers */
  public static makeSmallIntPacker({ minX, maxX, minY, maxY }: XyBounds) {
    const widthY = Math.ceil(Math.log2(maxY - minY + 1));
    const maskY = (1 << widthY) - 1;
    function packUnsafe(value: Point2D) {
      return ((value.x - minX) << widthY) | (value.y - minY);
    }
    function unpackUnsafe(value: number) {
      return new Point2D(
        (value >> widthY) + minX,
        (value & maskY) + minY,
      );
    }
    return {
      packUnsafe,
      /** throws on non-integer and oob */
      pack(value: Point2D) {
        if (
          !(
            Number.isInteger(value.x) &&
            Number.isInteger(value.y) &&
            value.x >= minX &&
            value.x <= maxX &&
            value.y >= minY &&
            value.y <= maxY
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
