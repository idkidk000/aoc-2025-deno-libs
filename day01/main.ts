import { parseArgs } from '@/lib/args.0.ts';
import { Logger } from '@/lib/logger.0.ts';
import { Point2D } from '@/lib/point2.0.ts';

function part1(_data: string, logger: Logger) {
  /*   // const grid = new Grid({ rows: 3, cols: 4, fill: 1 });
  // const grid=new Grid(data.split('\n').map((line)=>line.split('')))
  // const grid = new Grid({ rows: 3, cols: 5, fill: (x: number, y: number) => (x + y) % 10 });
  const grid = new Grid({ rows: 3, cols: 5, fill: (x: number, y: number) => ({ x, y }) });
  logger.debugLow(grid);
  logger.debugLow('counts', grid.rowCount, grid.colCount);
  logger.debugLow('getValue', grid.getValue(1, 2));
  // grid.setValue(1,2,'x')
  // grid.setValue(1, 2, 999);
  logger.debugLow('getValue', grid.getValue(1, 2));
  logger.debugLow(grid);
  logger.debugLow('rows', grid.rows);
  logger.debugLow('cols', grid.cols);
  const find = grid.find((value) => value.x === 4);
  logger.debugLow({ find });

  const v0 = new Point2D(3, 5);
  const v1 = new Point2D(-1, 4);
  logger.debugLow({
    v0,
    v1,
    add: v0.add(v1),
    sub: v0.subtract(v1),
    mult: v0.multiply(v1),
    multn: v0.multiply(5),
    dist2: v0.distance2(v1),
    dist2r: v1.distance2(v0),
    dist: v0.distance(v1),
    manhattan: v0.manhattan(v1),
  });
  const { inBounds, pack, unpack, packBigInt, unpackBigInt } = Point2D.makeUtils(-10, 10, -10, 10);
  for (const offset of Point2D.makeOffsets(8)) {
    const value = v0.add(offset.multiply(6));
    const packed = pack(value);
    const unpacked = unpack(packed);
    const packedBig=packBigInt(value)
    const unpackedBig=unpackBigInt(packedBig)
    logger.debugLow({ offset, value, inBounds: inBounds(value), packed, unpacked, equal: unpacked.equals(value),packedBig,unpackedBig,equalBig:unpackedBig.equals(value) });
  } */

  // const points=Array.from({length:10},()=>[
  //   new Point2D(Math.round(Math.random()*20)-10,Math.round(Math.random()*20)-10,),
  //   new Point2D(Math.round(Math.random()*20)-10,Math.round(Math.random()*20)-10,),
  // ])

  let count = 0;
  for (let i = 0; true; ++i) {
    const x = i ** 2;
    const y = (i - 1) ** 2;
    const points = Array.from({ length: 5 }, () =>
      new Point2D(
        Math.random() * x - (x / 2),
        Math.random() * y - (y / 2),
      ));
    // const bounds = Point2D.getBounds(points);
    // const utils = Point2D.makeUtils(bounds);
    const mapped = points.map((point) => {
      // const packedInt = utils.packInt(point);
      // const unpackedInt = utils.unpackInt(packedInt);
      // const equalInt = unpackedInt.eq(point);
      // const packedBig = utils.packBigInt(point);
      // const unpackedBig = utils.unpackBigInt(packedBig);
      // const equalBig = unpackedBig.eq(point);
      const packed = Point2D.fastPack(point);
      const unpacked = Point2D.fastUnpack(packed);
      const equal = unpacked.eq(point);
      return {
        point,
        // packedInt,
        // unpackedInt,
        // equalInt,
        // packedBig,
        // unpackedBig,
        // equalBig,
        packed,
        unpacked,
        equal,
      };
    });
    const failed = mapped.filter(({ equal }) => !equal);
    // const maxVal = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
    // const overflow = maxVal > Number.MAX_SAFE_INTEGER;
    if (failed.length === 0) {
      count += mapped.length;
      logger.debugLow(count);
    } else {
      logger.error(failed);
      throw new Error('unpacked not equal');
    }
  }
}

function part2(_data: string, logger: Logger) {
  const results: Record<'int' | 'big' | 'safe' | 'fast', { times: Record<'pack' | 'unpack', number[]>; pass: boolean }> = {
    int: { times: { pack: [], unpack: [] }, pass: false },
    big: { times: { pack: [], unpack: [] }, pass: false },
    safe: { times: { pack: [], unpack: [] }, pass: false },
    fast: { times: { pack: [], unpack: [] }, pass: false },
  };
  for (let run = 0; run < 10; ++run) {
    const points = Array.from({ length: 1_000_000 }, () => new Point2D(Math.round((Math.random() * 100) - 50), Math.round((Math.random() * 100) - 50)));
    const bounds = Point2D.getBounds(points);
    const utils = Point2D.makeUtils(bounds);

    // int
    const intPackStart = performance.now();
    const intPacked = points.map(utils.packInt);
    const intPackTime = performance.now() - intPackStart;
    results.int.times.pack.push(intPackTime);
    logger.info('intPack', { i: run }, intPackTime.toLocaleString(), 'ms');

    const intUnpackStart = performance.now();
    const intUnpacked = intPacked.map(utils.unpackInt);
    const intUnpackTime = performance.now() - intUnpackStart;
    results.int.times.unpack.push(intUnpackTime);
    logger.info('intUnpack', { i: run }, intUnpackTime.toLocaleString(), 'ms');

    const intPass = points.every((point, i) => intUnpacked[i].eq(point));
    logger[intPass ? 'success' : 'error']({ intPass, i: run });
    results.int.pass = intPass;

    // bigint
    const bigPackStart = performance.now();
    const bigPacked = points.map(utils.packBigInt);
    const bigPackTime = performance.now() - bigPackStart;
    results.big.times.pack.push(bigPackTime);
    logger.info('bigPack', { i: run }, bigPackTime.toLocaleString(), 'ms');

    const bigUnpackStart = performance.now();
    const bigUnpacked = bigPacked.map(utils.unpackBigInt);
    const bigUnpackTime = performance.now() - bigUnpackStart;
    results.big.times.unpack.push(bigUnpackTime);
    logger.info('bigUnpack', { i: run }, bigPackTime.toLocaleString(), 'ms');

    const bigPass = points.every((point, i) => bigUnpacked[i].eq(point));
    logger[bigPass ? 'success' : 'error']({ bigPass, i: run });
    results.big.pass = bigPass;

    // safe
    const safePackStart = performance.now();
    const safePacked = points.map(Point2D.safePack);
    const safePackTime = performance.now() - safePackStart;
    results.safe.times.pack.push(safePackTime);
    logger.info('safePack', { i: run }, safePackTime.toLocaleString(), 'ms');

    const safeUnpackStart = performance.now();
    const safeUnpacked = safePacked.map(Point2D.safeUnpack);
    const safeUnpackTime = performance.now() - safeUnpackStart;
    results.safe.times.unpack.push(safeUnpackTime);
    logger.info('safeUnpack', { i: run }, safeUnpackTime.toLocaleString(), 'ms');

    const safePass = points.every((point, i) => safeUnpacked[i].eq(point));
    logger[safePass ? 'success' : 'error']({ safePass, i: run });
    results.safe.pass = safePass;

    // fast
    const fastPackStart = performance.now();
    const fastPacked = points.map(Point2D.fastPack);
    const fastPackTime = performance.now() - fastPackStart;
    results.fast.times.pack.push(fastPackTime);
    logger.info('fastPack', { i: run }, fastPackTime.toLocaleString(), 'ms');

    const fastUnpackStart = performance.now();
    const fastUnpacked = fastPacked.map(Point2D.fastUnpack);
    const fastUnpackTime = performance.now() - fastUnpackStart;
    results.fast.times.unpack.push(fastUnpackTime);
    logger.info('fastUnpack', { i: run }, fastUnpackTime.toLocaleString(), 'ms');

    const fastPass = points.every((point, i) => fastUnpacked[i].eq(point));
    logger[fastPass ? 'success' : 'error']({ fastPass, i: run });
    results.fast.pass = fastPass;
  }

  Object.entries(results).forEach(([method, data]) => {
    logger[data.pass ? 'success' : 'error']({ method, pass: data.pass });
    Object.entries(data.times).forEach(([test, times]) => {
      const min = Math.min(...times);
      const max = Math.max(...times);
      const total = times.reduce((acc, item) => acc + item, 0);
      const avg = total / (times.length || 1);
      logger.info({ test, min, max, avg });
    });
  });
}

function main() {
  const logger = new Logger(import.meta.url);
  const { data, fileName, logLevel, ...args } = parseArgs(import.meta.url);
  logger.debugLow({ fileName, logLevel, ...args });
  if (args.part1) part1(data, new Logger(import.meta.url, 'part1', { logLevel }));
  if (args.part2) part2(data, new Logger(import.meta.url, 'part2', { logLevel }));
}

main();
