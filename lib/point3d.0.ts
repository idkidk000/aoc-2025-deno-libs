// DONE

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
  public add(other: Point3DLike) {
    return new Point3D(this.x + other.x, this.y + other.y, this.z + other.z);
  }
  public sub(other: Point3DLike) {
    return new Point3D(this.x - other.x, this.y - other.y, this.z - other.z);
  }
  public mult(other: Point3DLike): Point3D;
  public mult(value: number): Point3D;
  public mult(other: Point3DLike | number) {
    return typeof other === 'number'
      ? new Point3D(this.x * other, this.y * other, this.z * other)
      : new Point3D(this.x * other.x, this.y * other.y, this.z * other.z);
  }
  public eq(other: Point3DLike) {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }
  /** Sum of squared x and y distances */
  public dist2(other: Point3DLike) {
    return (this.x - other.x) ** 2 + (this.y - other.y) ** 2 + (this.z - other.z) ** 2;
  }
  public dist(other: Point3DLike) {
    return Math.sqrt(this.dist2(other));
  }
  /** Sum of x, y, and z distances */
  public manhattan(other: Point3DLike) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y) + Math.abs(this.z - other.z);
  }
  /** Max of x, y, and z distances */
  public chebyshev(other: Point3DLike) {
    return Math.max(Math.abs(this.x - other.x), Math.abs(this.y - other.y), Math.abs(this.z - other.z));
  }
  public static get offsets6() {
    return OFFSETS_6.map((item) => new Point3D(item));
  }
  public static get offsets26() {
    return OFFSETS_26.map((item) => new Point3D(item));
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
  /** Read x, y, and z (Float64) as Int64 using shared buffers and combine into an Int192
   *
   * Use `makeUtils().packSmallInt` for small integers
   */
  public static pack(value: Point3DLike) {
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
  public static makeInBounds({ minX, maxX, minY, maxY, minZ, maxZ }: Bounds3D) {
    return function (value: Point3DLike) {
      return value.x >= minX && value.x <= maxX && value.y >= minY && value.y <= maxY && value.z >= minZ && value.z <= maxZ;
    };
  }
  /** These utils are faster than the `pack` and `unpack` static methods but only handle small integers */
  public static makeSmallIntPacker({ minX, maxX, minY, maxY, minZ, maxZ }: Bounds3D) {
    const widthY = Math.ceil(Math.log2(maxY - minY + 1));
    const maskY = (1 << widthY) - 1;
    const widthZ = Math.ceil(Math.log2(maxZ - minZ + 1));
    const maskZ = (1 << widthZ) - 1;
    function packUnsafe(value: Point3DLike) {
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
