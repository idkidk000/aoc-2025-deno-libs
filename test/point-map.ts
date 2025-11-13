import { HashedMap } from '../lib/hashed-map.0.ts';
import { HashedSet } from '../lib/hashed-set.0.ts';
import { Logger } from '../lib/logger.0.ts';
import { PackedMap } from '../lib/packed-map.0.ts';
import { PackedSet } from '../lib/packed-set.0.ts';
import { Point2D } from '../lib/point2d.0.ts';

const logger = new Logger(import.meta.url);
const results: Record<'packedSet' | 'hashedSet' | 'packedMap' | 'hashedMap', { write: number[]; read: number[] }> = {
  hashedMap: { read: [], write: [] },
  hashedSet: { read: [], write: [] },
  packedMap: { read: [], write: [] },
  packedSet: { read: [], write: [] },
};

for (let run = 0; run < 10; ++run) {
  const points = Array.from({ length: 100_000 }, () => new Point2D(Math.random() * 10_000, Math.random() * 10_000));
  const pointsPair: [Point2D, number][] = points.map((point, i) => [point, i]);

  // PackedSet
  const packedSetWriteStarted = performance.now();
  const packedSet = new PackedSet(Point2D.fastPack, Point2D.fastUnpack, points);
  const packedSetWriteTime = performance.now() - packedSetWriteStarted;
  results.packedSet.write.push(packedSetWriteTime);

  const packedSetReadStarted = performance.now();
  const unpackedSet = packedSet.keys().toArray();
  const packedSetReadTime = performance.now() - packedSetReadStarted;
  results.packedSet.read.push(packedSetReadTime);

  logger.info({ run }, 'PackedSet', { packedSetWriteTime, packedSetReadTime });

  // HashedSet
  const hashedSetWriteStarted = performance.now();
  const hashedSet = new HashedSet(Point2D.fastPack, points);
  const hashedSetWriteTime = performance.now() - hashedSetWriteStarted;
  results.hashedSet.write.push(hashedSetWriteTime);

  const hashedSetReadStarted = performance.now();
  const unhashedSet = hashedSet.keys().toArray();
  const hashedSetReadTime = performance.now() - hashedSetReadStarted;
  results.hashedSet.read.push(hashedSetReadTime);

  logger.info({ run }, 'HashedSet', { hashedSetWriteTime, hashedSetReadTime });

  // PackedMap
  const packedMapWriteStarted = performance.now();
  const packedMap = new PackedMap(Point2D.fastPack, Point2D.fastUnpack, pointsPair);
  const packedMapWriteTime = performance.now() - packedMapWriteStarted;
  results.packedMap.write.push(packedMapWriteTime);

  const packedMapReadStarted = performance.now();
  const unpackedMap = packedMap.keys().toArray();
  const packedMapReadTime = performance.now() - packedMapReadStarted;
  results.packedMap.read.push(packedMapReadTime);

  logger.info({ run }, 'PackedMap', { packedMapWriteTime, packedMapReadTime });

  // HashedMap
  const hashedMapWriteStarted = performance.now();
  const hashedMap = new HashedMap(Point2D.fastPack, pointsPair);
  const hashedMapWriteTime = performance.now() - hashedMapWriteStarted;
  results.hashedMap.write.push(hashedMapWriteTime);

  const hashedMapReadStarted = performance.now();
  const unhashedMap = hashedMap.keys().toArray();
  const hashedMapReadTime = performance.now() - hashedMapReadStarted;
  results.hashedMap.read.push(hashedMapReadTime);

  logger.info({ run }, 'HashedMap', { hashedMapWriteTime, hashedMapReadTime });
}

Object.entries(results).forEach(([key, data]) => {
  logger.success(key);
  for (const test of ['write', 'read'] as const) {
    const min = Math.min(...data[test]);
    const max = Math.max(...data[test]);
    const total = data[test].reduce((acc, item) => acc + item, 0);
    const avg = total / (data[test].length || 1);
    logger.info(test, { min, max, avg });
  }
});
