interface Point {
  x: number;
  y: number;
}
interface Line {
  a: Point;
  b: Point;
}

function factorial(value: number): number | undefined {
  if (value < 0) return undefined;
  if (value === 0) return 1;
  const next = factorial(value - 1);
  if (typeof next === 'undefined') return next;
  return value * next;
}

/** greatest common denominator */
function gcd(left: number, right: number): number {
  while (right !== 0) [left, right] = [right, left % right];
  return left;
}

export const MathsUtils = {
  clamp(value: number, min: number, max: number): number {
    return Math.max(Math.min(value, max), min);
  },
  factorial,
  gcd,
  /** lowest common multiple */
  lcm(...values: Array<number>): number {
    return values.reduce((acc, item) => (acc * item) / gcd(acc, item));
  },
  /** linear interpolate */
  lerp(left: number, right: number, steps: number, step: number) {
    return left + ((right - left) / steps) * step;
  },
  lineIntersect(
    { a: { x: x0, y: y0 }, b: { x: x1, y: y1 } }: Line,
    { a: { x: x2, y: y2 }, b: { x: x3, y: y3 } }: Line,
    infinite: boolean = false,
  ): Point | undefined {
    const denominator = (x0 - x1) * (y2 - y3) - (y0 - y1) * (x2 - x3);
    if (denominator === 0) return undefined;
    const line0Distance = ((x0 - x2) * (y2 - y3) - (y0 - y2) * (x2 - x3)) / denominator;
    const line1Distance = ((x0 - x2) * (y0 - y1) - (y0 - y2) * (x0 - x1)) / denominator;
    return infinite || (line0Distance >= 0 && line0Distance <= 1 && line1Distance >= 0 && line1Distance <= 1)
      ? { x: x0 + line0Distance * (x1 - x0), y: y0 + line0Distance * (y1 - y0) }
      : undefined;
  },
  minMax(...values: Array<number>): [number, number] {
    return values.reduce((acc, item) => [Math.min(acc[0], item), Math.max(acc[1], item)], [Infinity, -Infinity]);
  },
  /** positive modulo */
  modP(value: number, mod: number): number {
    const result = value % mod;
    return result >= 0 ? result : result + mod;
  },
};
