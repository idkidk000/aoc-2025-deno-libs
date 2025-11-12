export class Vec2 {
  constructor(public x: number, public y: number) {}
  public add(other: Vec2) {
    return new Vec2(this.x + other.x, this.y + other.y);
  }
  public sub(other: Vec2) {
    return new Vec2(this.x - other.x, this.y - other.y);
  }
  public mult(other: Vec2) {
    return new Vec2(this.x * other.x, this.y * other.y);
  }
}

export function makeVec2Hasher({ minX = 0, minY = 0, maxY }: { minX?: number; minY?: number; maxY: number }) {
  const rangeY = maxY - minY;
  return function (value: Vec2) {
    return ((value.x - minX) * rangeY) + (value.y - minY);
  };
}

export class Vec3 {
  constructor(public x: number, public y: number, public z: number) {}
  public add(other: Vec3) {
    return new Vec3(this.x + other.x, this.y + other.y, this.z + other.z);
  }
  public sub(other: Vec3) {
    return new Vec3(this.x - other.x, this.y - other.y, this.z - other.z);
  }
  public mult(other: Vec3) {
    return new Vec3(this.x * other.x, this.y * other.y, this.z * other.z);
  }
}

export function makeVec3Hasher({ minX = 0, minY = 0, maxY, minZ = 0, maxZ }: { minX?: number; minY?: number; maxY: number; minZ?: number; maxZ: number }) {
  const rangeY = maxY - minY;
  const rangeZ = maxZ - minZ;
  return function (value: Vec3) {
    return ((value.x - minX) * rangeY * rangeZ) + ((value.y - minY) * rangeZ) + (value.z - minZ);
  };
}
