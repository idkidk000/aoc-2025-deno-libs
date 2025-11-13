import { Logger } from '@/lib/logger.0.ts';
import { Point2D } from '@/lib/point2.0.ts';

const logger = new Logger(import.meta.url);

const results: Record<'int' | 'big' | 'safe' | 'fast', { times: Record<'pack' | 'unpack', number[]>; fail: boolean }> = {
  int: { times: { pack: [], unpack: [] }, fail: false },
  big: { times: { pack: [], unpack: [] }, fail: false },
  safe: { times: { pack: [], unpack: [] }, fail: false },
  fast: { times: { pack: [], unpack: [] }, fail: false },
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

  const intFail = !points.every((point, i) => intUnpacked[i].eq(point));
  logger[intFail ? 'error' : 'success']({ intFail, i: run });
  results.int.fail ||= intFail;

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

  const bigFail = !points.every((point, i) => bigUnpacked[i].eq(point));
  logger[bigFail ? 'error' : 'success']({ bigFail, i: run });
  results.big.fail ||= bigFail;

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

  const safeFail = !points.every((point, i) => safeUnpacked[i].eq(point));
  logger[safeFail ? 'error' : 'success']({ safeFail, i: run });
  results.safe.fail ||= safeFail;

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

  const fastFail = !points.every((point, i) => fastUnpacked[i].eq(point));
  logger[fastFail ? 'error' : 'success']({ fastFail, i: run });
  results.fast.fail ||= fastFail;
}

Object.entries(results).forEach(([method, data]) => {
  logger[data.fail ? 'success' : 'error']({ method, fail: data.fail });
  Object.entries(data.times).forEach(([test, times]) => {
    const min = Math.min(...times);
    const max = Math.max(...times);
    const total = times.reduce((acc, item) => acc + item, 0);
    const avg = total / (times.length || 1);
    logger.info({ test, min, max, avg });
  });
});
