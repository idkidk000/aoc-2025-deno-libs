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
