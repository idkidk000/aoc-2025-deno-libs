export type XyzTuple = [x: number, y: number, z: number];
export interface XyzObject {
  x: number;
  y: number;
  z: number;
}
export interface XyzBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

const OFFSETS_6: XyzTuple[] = [[0, 0, -1], [0, 1, 0], [1, 0, 0], [0, -1, 0], [-1, 0, 0], [0, 0, 1]];
const OFFSETS_26: XyzTuple[] = [
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

export class Point3D {
  constructor(public x: number, public y: number, public z: number) {}
  public add(other: Point3D) {
    return new Point3D(this.x + other.x, this.y + other.y, this.z + other.z);
  }
  public sub(other: Point3D) {
    return new Point3D(this.x - other.x, this.y - other.y, this.z - other.z);
  }
  public mult(other: Point3D): Point3D;
  public mult(value: number): Point3D;
  public mult(other: Point3D | number) {
    return other instanceof Point3D
      ? new Point3D(this.x * other.x, this.y * other.y, this.z * other.z)
      : new Point3D(this.x * other, this.y * other, this.z * other);
  }
  public eq(other: Point3D) {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }
  //TODO: should these be cubed?
  /** Sum of squared x and y distances */
  public dist2(other: Point3D) {
    return (this.x - other.x) ** 2 + (this.y - other.y) ** 2 + (this.z - other.z) ** 2;
  }
  //TODO: should this be cube root?
  public dist(other: Point3D) {
    return Math.sqrt(this.dist2(other));
  }
  /** Sum of x, y, and z distances */
  public manhattan(other: Point3D) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) + Math.abs(this.z - other.z);
  }
  /** Max of x, y, and z distances */
  public chebyshev(other: Point3D) {
    return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y), Math.abs(this.z - other.z));
  }
  public get xyz(): XyzObject {
    return { x: this.x, y: this.y, z: this.z };
  }
  public static get offsets6() {
    return OFFSETS_6.map(([x, y, z]) => new Point3D(x, y, z));
  }
  public static get offsets26() {
    return OFFSETS_26.map(([x, y, z]) => new Point3D(x, y, z));
  }
  public static bounds(iterable: Iterable<Point3D>): XyzBounds {
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
  /** Read x, y, and z (Float64) as Int64 using shared buffers and combine into an Int192
   *
   * Use `makeUtils().packSmallInt` for small integers
   */
  public static pack(value: Point3D) {
    float64Array[0] = value.x;
    float64Array[1] = value.y;
    float64Array[2] = value.z;
    const [x, y, z] = bigUint64Array;
    return (x << 128n) | (y << 64n) | z;
  }
  public static unpack(value: bigint) {
    bigUint64Array[0] = value >> 128n;
    bigUint64Array[1] = (value >> 64n) & INT64_MASK;
    bigUint64Array[2] = value & INT64_MASK;
    const [x, y, z] = float64Array;
    return new Point3D(x, y, z);
  }
  public static makeInBounds({ minX, maxX, minY, maxY, minZ, maxZ }: XyzBounds) {
    return function (value: Point3D) {
      return value.x >= minX && value.x <= maxX && value.y >= minY && value.y <= maxY && value.z >= minZ && value.z <= maxZ;
    };
  }
  /** These utils are faster than the `pack` and `unpack` static methods but only handle small integers */
  public static makeSmallIntPacker({ minX, maxX, minY, maxY, minZ, maxZ }: XyzBounds) {
    const widthY = Math.ceil(Math.log2(maxY - minY + 1));
    const maskY = (1 << widthY) - 1;
    const widthZ = Math.ceil(Math.log2(maxZ - minZ + 1));
    const maskZ = (1 << widthZ) - 1;
    function packUnsafe(value: Point3D) {
      return ((value.x - minX) << (widthY + widthZ)) |
        ((value.y - minY) << widthZ) |
        (value.z - minZ);
    }
    function unpackUnsafe(value: number) {
      return new Point3D(
        (value >> (widthY + widthZ)) + minX,
        ((value >> widthZ) & maskY) + minY,
        (value & maskZ) + minZ,
      );
    }
    return {
      packUnsafe,
      /** throws on non-integer and oob */
      pack(value: Point3D) {
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
