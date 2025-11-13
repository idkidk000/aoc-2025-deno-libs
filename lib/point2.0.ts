// DONE

const OFFSETS_4 = [[0, -1], [1, 0], [0, 1], [-1, 0]];
const OFFSETS_8 = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

// these both refer to the same area in memory. preallocating and reusing is significantly faster than allocating and discarding on each call, but it's not async safe
const float64Array = new Float64Array(2);
const bigUint64Array = new BigUint64Array(float64Array.buffer);

export class Point2 {
  constructor(public x: number, public y: number) {}
  public add(other: Point2) {
    return new Point2(this.x + other.x, this.y + other.y);
  }
  public sub(other: Point2) {
    return new Point2(this.x - other.x, this.y - other.y);
  }
  public mult(other: Point2): Point2;
  public mult(value: number): Point2;
  public mult(other: Point2 | number) {
    return other instanceof Point2 ? new Point2(this.x * other.x, this.y * other.y) : new Point2(this.x * other, this.y * other);
  }
  public eq(other: Point2) {
    return this.x === other.x && this.y === other.y;
  }
  /** Sum of squared x and y distances */
  public dist2(other: Point2) {
    return (this.x - other.x) ** 2 + (this.y - other.y) ** 2;
  }
  public dist(other: Point2) {
    return Math.sqrt(this.dist2(other));
  }
  /** Sum of x and y distances */
  public manhattan(other: Point2) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }
  /** Max of x and y distances */
  public chebyshev(other: Point2) {
    return Math.max(Math.abs(this.x - other.x), Math.abs(this.x - other.x));
  }
  public static get offsets4() {
    return OFFSETS_4.map(([x, y]) => new Point2(x, y));
  }
  public static get offsets8() {
    return OFFSETS_8.map(([x, y]) => new Point2(x, y));
  }
  public static getBounds(iterable: Iterable<Point2>) {
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
  public static makeUtils({ minX, maxX, minY, maxY }: { minX: number; maxX: number; minY: number; maxY: number }) {
    const rangeY = maxY - minY + 1;
    // don't divide or multiply by 0
    const safeRangeY = Math.ceil(rangeY) || 1;
    // shifting and masking by 0 is fine when all ys are the same value
    const widthY = BigInt(Math.ceil(Math.log2(rangeY)));
    const maskY = (1n << widthY) - 1n;
    function inBounds(value: Point2) {
      return value.x >= minX && value.x <= maxX && value.y >= minY && value.y <= maxY;
    }
    return {
      inBounds,
      /** `value` **must** contain integer coordinates
       *
       * Can return values > `Number.MAX_SAFE_INTEGER` for very large coordinates, but only those lower can be unpacked
       *
       *  Throws on out-of-bounds
       */
      packInt(value: Point2) {
        if (!inBounds(value)) throw new Error('cannot pack an out-of-bounds value');
        return (value.x - minX) * safeRangeY + (value.y - minY);
      },
      /** Throws on `value` > `Number.MAX_SAFE_INTEGER` */
      unpackInt(value: number) {
        if (value > Number.MAX_SAFE_INTEGER) throw new Error(`overflow: ${value} > Number.MAX_SAFE_INTEGER and cannot be unpacked`);
        return new Point2(Math.floor(value / safeRangeY) + minX, (value % safeRangeY) + minY);
      },
      /** `value` **must** contain integer coordinates
       *
       * Throws on out-of-bounds
       *
       * Similar performance to `safePack`, but can produce smaller return values
       *
       * @returns bigint of minimum width
       */
      packBigInt(value: Point2) {
        if (!inBounds(value)) throw new Error('cannot pack an out-of-bounds value');
        return (BigInt(value.x - minX) << widthY) | (BigInt(value.y - minY));
      },
      unpackBigInt(value: bigint) {
        return new Point2(Number(value >> widthY) + minX, Number(value & maskY) + minY);
      },
    };
  }
  /** Read x and y's binary representation as 64bit ints and smush together. Handles floats and large values. Accurate but slow due to buffer allocations
   * @returns (typepunned x width + 64) bit bigint
   */
  public static safePack(value: Point2) {
    const [x, y] = new BigUint64Array(new Float64Array([value.x, value.y]).buffer);
    return (x << 64n) | y;
  }
  public static safeUnpack(value: bigint) {
    const [x, y] = new Float64Array(new BigUint64Array([value >> 64n, value & ((1n << 64n) - 1n)]).buffer);
    return new Point2(x, y);
  }
  /** Same as `safePack`, but using shared buffers
   *
   * `packInt` is faster and produces much smaller return values for small integers
   *
   * `packBigInt` is about the same speed but can produce smaller return values, but `unpackBigInt` is slower than `fastUnpack`
   *
   * **not async safe** */
  public static fastPack(value: Point2) {
    // use the preallocated array buffers
    float64Array[0] = value.x;
    float64Array[1] = value.y;
    const [x, y] = bigUint64Array;
    return (x << 64n) | y;
  }
  /** Same as `safeUnpack`, but using shared buffers
   *
   * Only `unpackInt` is faster
   *
   *  **not async safe** */
  public static fastUnpack(value: bigint) {
    // use the preallocated array buffers
    bigUint64Array[0] = value >> 64n;
    bigUint64Array[1] = value & ((1n << 64n) - 1n);
    const [x, y] = float64Array;
    return new Point2(x, y);
  }
}
