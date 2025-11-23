import { Point3D, Point3DLike } from '@/lib/point3d.0.ts';
import { HashedSet } from '@/lib/hashed-set.0.ts';
import { exit } from 'node:process';

const [runs, length] = Deno.args.includes('-vfast') ? [1, 1000] : Deno.args.includes('-fast') ? [5, 1_000_000] : [10, 10_000_000];

const tests = [
  'smallInt',
  // 'smallFloat',
  // 'largeInt',
  // 'largeFloat'
] as const;
type Test = (typeof tests)[number];

const makePoints = (test: Test): Point3DLike[] => {
  const make = () => {
    switch (test) {
      case 'largeFloat':
        return (Math.random() - 0.5) * Number.MAX_SAFE_INTEGER;
      case 'largeInt':
        return Math.round((Math.random() - 0.5) * Number.MAX_SAFE_INTEGER);
      case 'smallFloat':
        return (Math.random() - 0.5) * 2 * 10_000;
      // case 'smallInt':
      //   return Math.round((Math.random() - 0.5) * 2 * (length / 100));
      default:
        throw new Error(`invalid makePoints test: ${test}`);
    }
  };
  if (test === 'smallInt') {
    const arr: Point3DLike[] = [];
    const bound = Math.ceil(Math.cbrt(length) / 2);
    for (let x = -bound; x < bound; ++x) {
      for (let y = -bound; y < bound; ++y) {
        for (let z = -bound; z < bound; ++z) {
          arr.push({ x, y, z });
          if (arr.length === length) return arr;
        }
      }
    }
    throw new Error('did not generate smallInt input array');
  } else {
    const set = new HashedSet(Point3D.pack);
    while (set.size < length) {
      const center = { x: make(), y: make(), z: make() };
      for (const point of [center, ...Point3D.neighbours(center, 26)]) {
        set.add(point);
        if (set.size === length) break;
      }
    }
    return [...set];
  }
};

const uint32Array = new Uint32Array(6);
const uint16Array = new Uint16Array(uint32Array.buffer);
const float64Array = new Float64Array(uint32Array.buffer);
const float32Array = new Float64Array(uint32Array.buffer);

const packInt21Offset = 1 << 20;
//BUG: this might all be backwards
function packInt21(value: Point3DLike): number {
  //TODO: throw if oob
  uint32Array[0] = value.x + packInt21Offset;
  uint32Array[1] = value.y + packInt21Offset;
  uint32Array[2] = value.z + packInt21Offset;

  // pack from u16[0-1,2-3,4-5] to u16[8-11]
  // u32[0](x)(x) lower half full
  uint16Array[8] = uint16Array[0];
  // u32[0](x) upper half lower 5 | u32[1](y) lower half upper 11
  uint16Array[9] = (uint16Array[1] << 11) | (uint16Array[2] >> 5);
  // u32[1](y) lower half lower 5 | u32[1](y) upper half lower 5 | u32[2](z) lower half upper 6
  uint16Array[10] = (uint16Array[2] << 11) | ((uint16Array[3] & 0x1f) << 6) | (uint16Array[4] >> 10);
  // u32[2](z) lower half lower 10 | u32[2](z) upper half lower 5 (with gap so float64 exponent is not all on - i.e. NaN)
  uint16Array[11] = uint16Array[4] << 6 | ((uint16Array[5] & 0x1e) << 1) | (uint16Array[5] & 0x1);

  // console.debug('pack', value);
  // uint16Array.forEach((item, i) => console.log('  pack', i.toString().padEnd(2, ' '), item.toString(2).padStart(16, '.')));
  return float64Array[2];
}
function unpackInt21(value: number): Point3DLike {
  float64Array[0] = 0;
  float64Array[0] = 1;
  float64Array[2] = value;

  // unpack from u16[8-11] to u16[0-1,2-3,4-5]
  // u32[0](x) lower half full
  uint16Array[0] = uint16Array[8];
  // u32[0](x) upper half lower 5
  uint16Array[1] = uint16Array[9] >> 11;

  // u32[1](y) lower half upper 11 | lower 5
  uint16Array[2] = uint16Array[9] << 5 | uint16Array[10] >> 11;
  // u32[1](y) upper half lower 5
  uint16Array[3] = (uint16Array[10] >> 6) & 0x1f;

  // u32[2](z) lower half upper 6 | lower 10
  uint16Array[4] = (uint16Array[10] << 10) | (uint16Array[11] >> 6);
  // u32[2](z) upper half lower 5
  uint16Array[5] = ((uint16Array[11] >> 1) & 0x1e) | (uint16Array[11] & 0x1);

  const x = uint32Array[0] - packInt21Offset;
  const y = uint32Array[1] - packInt21Offset;
  const z = uint32Array[2] - packInt21Offset;
  // console.debug('unpack', { x, y, z });
  // uint16Array.forEach((item, i) => console.log('  unpack', i.toString().padEnd(2, ' '), item.toString(2).padStart(16, '.')));
  return { x, y, z };
}

function packFloat21(value: Point3DLike): number {
  float32Array[0] = value.x;
  float32Array[1] = value.y;
  float32Array[2] = value.z;

  // f32 has 8 exponent and 23 mantissa bits
  // f16 has 5 exponent and 10 mantissa bits
  // f21 can have 6 exponent and 14 mantissa bits i suppose. probably ought to test a bit

  // f32 structure:
  //   0-22 : l0-15, h0-7: mantissa (we want 9-22)
  //   23-30: h7-14      : exponent (we want 23-28)
  //   31   : h15        : sign

  // f21 structure
  //   0-13 mantissa
  //   14-19 exponent
  //   20: sign

  // pack from u16[0-1,2-3,4-5] to u16[8-11]
  // f32[0](x) mantissa 9-15 | f32[0](x) mantissa 16-22, exponent 23-24
  uint16Array[8] = (uint16Array[0] >> 9) | (uint16Array[1] << 7);
  // f32[0](x) exponent 25-28 | f32[0](x) sign | f32[1](y) mantissa 9-15 | f32[1](y) mantissa 16-19
  uint16Array[9] = ((uint16Array[1] & 0x1e00) >> 9) | ((uint16Array[1] & 0x8000) >> 11) | ((uint16Array[2] & 0xfe00) >> 4) | (uint16Array[3] << 12);
  // f32[1](y) mantissa 20-22, exponent 23-28 | f32[1](y) sign | f32[2](z) mantissa 9-14
  uint16Array[10] = ((uint16Array[3] & 0x1fc0) >> 4) | ((uint16Array[3] & 0x8000) >> 6) | ((uint16Array[4] & 0x7e00) << 1);
  // f32[2](z) mantissa 15 | f32[2](z) mantissa 16-22, exponent 23-28 | off (NaN) | f32[2](z) sign
  uint16Array[11] = (uint16Array[4] >> 15) | ((uint16Array[5] & 0x1fff) << 1) | (uint16Array[5] & 0x8000);

  console.log('packf21', value);
  uint16Array.forEach((item, i) => console.log('  ', i.toString().padEnd(2, ' '), item.toString(2).padStart(16, '.')));

  return float64Array[2];
}
function unpackFloat21(value: number): Point3DLike {
  float64Array[2] = value;
  float64Array[0] = 0;
  float64Array[1] = 0;

  // unpack from u16[8-11] to u16[0-1,2-3,4-5]
  // f32[0](x) mantissa 9-15
  uint16Array[0] = uint16Array[8] << 9;
  // f32[0](x) mantissa 16-22, exponent 23-24 | exponent 25-28 | sign
  uint16Array[1] = (uint16Array[8] >> 7) | ((uint16Array[9] & 0xf) << 9) | ((uint16Array[9] & 0x10) << 11);

  const [x, y, z] = float32Array;
  return { x, y, z };
}

// const value = -((1 << 10) - 1); //1 | (1 << 3) | (1 << 5) | (1 << 7) | (1 << 9) | (1 << 11) | (1 << 13) | (1 << 15) | (1 << 17) | (1 << 19);

// const input: Point3DLike[] = [
//   { x: value, y: 0, z: 0 },
//   { x: 0, y: value, z: 0 },
//   { x: 0, y: 0, z: value },
// ];

// for (const item of input) {
//   const packed = packInt21(item);
//   const unpacked = unpackInt21(packed);
//   console.log(item, 'packed', packed, 'unpacked', unpacked);
// }

for (const item of [{ x: 1.5, y: 2.25, z: 3.0 }] satisfies Point3DLike[]) {
  const packed = packFloat21(item);
  const unpacked = unpackFloat21(packed);
  console.log(item, packed, unpacked);
}

// const points = makePoints('smallInt');
// for (const [i, item] of points.entries()) {
//   // const packedLocal = packInt21(item);
//   const packedClass = Point3D.packInt21(item);
//   // console.log(i, packedLocal === packedClass, packedLocal, packedClass);
//   // const unpackedLocal = unpackInt21(packedLocal);
//   const unpackedClass = Point3D.unpackInt21(packedClass);
//   // const localEq = Point3D.eq(item, unpackedLocal);
//   const classEq = Point3D.eq(item, unpackedClass);
//   // console.error(i, { localEq, classEq }, item, unpackedLocal, unpackedClass);
//   console.error(i, classEq, item, unpackedClass);
// }

exit(1);
const results = new Map<Test, number>();

for (const test of tests) {
  const input = makePoints(test);
  let errors = 0;
  for (const item of input) {
    const packed = packInt21(item);
    const unpacked = unpackInt21(packed);
    const eq = Point3D.eq(item, unpacked);
    // console.log(item, 'unpacked', unpacked, 'eq', eq);
    if (!eq) ++errors;
  }
  const rate = errors / (input.length || 1);
  // deno-lint-ignore no-console
  console.log(test, 'total rate', `${rate * 100}%`);
  results.set(test, rate);
}

// deno-lint-ignore no-console
console.log({ length });
results.entries().forEach(([test, rate]) => console.log('final', test, `${rate * 100}%`));
