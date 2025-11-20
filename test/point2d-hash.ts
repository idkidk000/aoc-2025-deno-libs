import { ansiStyles, Logger } from '@/lib/logger.0.ts';
import { Point2D, Point2DLike } from '@/lib/point2d.0.ts';
import { MathsUtils } from '@/lib/maths-utils.0.ts';
import { HashedSet } from '@/lib/hashed-set.0.ts';

const [runs, length] = Deno.args.includes('-vfast') ? [1, 1000] : Deno.args.includes('-fast') ? [1, 1_000_000] : [10, 10_000_000];
const logger = new Logger(import.meta.url);

const tests = ['smallInt', 'smallFloat', 'largeInt', 'largeFloat'] as const;
type Test = (typeof tests)[number];

const methods = ['hash', 'hash2', 'hash3'] as const;
type Method = (typeof methods)[number];

const results: Record<Method, Record<Test, { time: number; rate: number }[]>> = {
  hash: { largeFloat: [], largeInt: [], smallFloat: [], smallInt: [] },
  hash2: { largeFloat: [], largeInt: [], smallFloat: [], smallInt: [] },
  hash3: { largeFloat: [], largeInt: [], smallFloat: [], smallInt: [] },
};

const makePoints = (test: Test): Point2DLike[] => {
  const make = () => {
    switch (test) {
      case 'largeFloat':
        return (Math.random() - 0.5) * Number.MAX_SAFE_INTEGER;
      case 'largeInt':
        return Math.round((Math.random() - 0.5) * Number.MAX_SAFE_INTEGER);
      case 'smallFloat':
        return (Math.random() - 0.5) * 2 * 10_000;
      case 'smallInt':
        return Math.round((Math.random() - 0.5) * 2 * (length / 100));
      default:
        throw new Error(`invalid makePoints test: ${test}`);
    }
  };
  const set = new HashedSet(Point2D.pack);
  // this takes a while for small ints due to collisions
  while (set.size < length) set.add({ x: make(), y: make() });
  return [...set];
};

const wait = () => new Promise((resolve) => setTimeout(resolve, 500));

for (let run = 0; run < runs; ++run) {
  for (const test of tests.toSorted(() => Math.random() - 0.5)) {
    logger.debugMed(test, 'generating', { run, length });
    const input = makePoints(test);
    for (const method of methods.toSorted(() => Math.random() - 0.5)) {
      const output = new Array(input.length);
      let i = 0;
      await wait();
      logger.debugMed('  running', { method });

      const started = performance.now();
      if (method === 'hash') { for (const item of input) output[i++] = Point2D.hash(item); }
      else if (method === 'hash2') { for (const item of input) output[i++] = Point2D.hash2(item); }
      else if (method === 'hash3') { for (const item of input) output[i++] = Point2D.hash3(item); }
      const time = performance.now() - started;

      logger.debugMed('  checking', { method });
      const hashes = new Set(output);
      const rate = (length - hashes.size) / length;

      results[method][test].push({ rate, time });
      logger.debugLow('  ', { method, rate: rate * 100, time });
    }
  }

  for (const method of methods) {
    logger.info(ansiStyles.bold, method, ansiStyles.reset);
    for (const test of tests) {
      logger.info('  ', ansiStyles.bold, test, ansiStyles.reset, { run });
      for (const resultType of ['time', 'rate'] as const) {
        const data = results[method][test].map((item) => item[resultType]);
        const [min, max] = MathsUtils.minMax(...data).map((item) => resultType === 'rate' ? `${MathsUtils.roundTo(item * 100, 5)}%` : MathsUtils.roundTo(item));
        const avg = resultType === 'rate' ? `${MathsUtils.roundTo(MathsUtils.avg(...data) * 100, 5)}%` : MathsUtils.roundTo(MathsUtils.avg(...data));
        logger.info('    ', resultType, { min, max, avg });
      }
    }
  }
}
