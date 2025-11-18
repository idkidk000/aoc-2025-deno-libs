import { Logger } from '../lib/logger.0.ts';
import { MathsUtils } from '../lib/maths-utils.0.ts';

const size = 1000;
const logger = new Logger(import.meta.url);

const results: Record<'calc' | 'cache', number[]> = {
  cache: [],
  calc: [],
};

for (let run = 0; run < 10; ++run) {
  const cache = new Map<number, { r: number; c: number; x: number; y: number; i: number }>();

  const calcStart = performance.now();
  for (let loop = 0; loop < 100; ++loop) {
    for (let i = 0; i < size ** 2; ++i) {
      const r = Math.floor(i / size);
      const c = i - r * size;
      const y = size - r - 1;
      const _coord = { x: c, y, r, c, i };
    }
  }
  const calcTime = performance.now() - calcStart;
  results.calc.push(calcTime);

  const cacheStart = performance.now();
  for (let loop = 0; loop < 1000; ++loop) {
    for (let i = 0; i < size ** 2; ++i) {
      if (cache.has(i)) continue;
      const r = Math.floor(i / size);
      const c = i - r * size;
      const y = size - r - 1;
      const coord = { x: c, y, r, c, i };
      cache.set(i, coord);
    }
  }
  const cacheTime = performance.now() - cacheStart;
  results.cache.push(cacheTime);

  logger.info({ calcTime, cacheTime });
}

for (const [method, times] of Object.entries(results)) {
  const min = MathsUtils.roundTo(Math.min(...times));
  const max = MathsUtils.roundTo(Math.max(...times));
  const total = times.reduce((acc, item) => acc + item, 0);
  const avg = MathsUtils.roundTo(total / (times.length || 1));
  logger.info(method, { min, max, avg });
}
