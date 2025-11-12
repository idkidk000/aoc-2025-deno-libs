//TODO: bigint version

export class Point2 {
  constructor(public x: number, public y: number) {}
  public add(other: Point2) {
    return new Point2(this.x + other.x, this.y + other.y);
  }
  public subtract(other: Point2) {
    return new Point2(this.x - other.x, this.y - other.y);
  }
  public multiply(other: Point2): Point2;
  public multiply(value: number): Point2;
  public multiply(other: Point2 | number) {
    return other instanceof Point2 ? new Point2(this.x * other.x, this.y * other.y) : new Point2(this.x * other, this.y * other);
  }
  public equals(other: Point2) {
    return this.x === other.x && this.y === other.y;
  }
  public distance2(other: Point2) {
    return (this.x - other.x) ** 2 + (this.y - other.y) ** 2;
  }
  public distance(other: Point2) {
    return Math.sqrt(this.distance2(other));
  }
  public manhattan(other: Point2) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }
  public static makeOffsets(count: 4 | 8) {
    if (count === 4) return [new Point2(0, -1), new Point2(1, 0), new Point2(0, 1), new Point2(-1, 0)];
    if (count === 8) {
      return [
        new Point2(0, -1),
        new Point2(1, -1),
        new Point2(1, 0),
        new Point2(1, 1),
        new Point2(0, 1),
        new Point2(-1, 1),
        new Point2(-1, 0),
        new Point2(-1, -1),
      ];
    }
    throw new Error('invalid count');
  }
  public static makeUtils({ minX, maxX, minY, maxY }: { minX: number; maxX: number; minY: number; maxY: number }) {
    // don't divide or multiply by 0
    const rangeY = (maxY - minY + 1) || 1;
    // 0 here is ok
    const widthY = BigInt(Math.ceil(Math.log2(maxY - minY + 1)));
    const maskY = (1n << widthY) - 1n;
    return {
      inBounds(value: Point2) {
        return value.x >= minX && value.x <= maxX && value.y >= minY && value.y <= maxY;
      },
      /** `Number` doesn't seem to be affected by `Number.MAX_SAFE_INTEGER` anymore */
      pack(value: Point2) {
        return (value.x - minX) * rangeY + (value.y - minY);
      },
      // BUG: doesn't handle floats
      unpack(value: number) {
        return new Point2(
          Math.floor(value / rangeY) + minX,
          (value % rangeY) + minY,
          // x + minX,
          // y + minY,
        );
      },
      /** possibly not required. `Point` must contain integer coordinates which can be cast to `BigInt` */
      packBigInt(value: Point2) {
        return (BigInt(value.x - minX) << widthY) | (BigInt(value.y - minY));
      },
      /** possibly not required. `Point` must contain integer coordinates which can be cast to `BigInt` */
      unpackBigInt(value: bigint) {
        return new Point2(Number(value >> widthY) + minX, Number(value & maskY) + minY);
      },
    };
  }
  public static getBounds(iterable: Iterable<Point2>) {
    return [...iterable].reduce(
      (acc, item) => ({
        minX: Math.min(acc.minX, item.x),
        maxX: Math.max(acc.maxX, item.x),
        minY: Math.min(acc.minY, item.y),
        maxY: Math.max(acc.maxY, item.y),
      }),
      { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity },
    );
  }
}
