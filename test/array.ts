import { Logger } from '@/lib/logger.0.ts';

const logger = new Logger(import.meta.url);

const results: Record<'shift' | 'pop', number[]> = {
  pop: [],
  shift: [],
};

const makeArray = () => Array.from({ length: 100_000 }, () => Math.random());
for (let run = 0; run < 100; ++run) {
  const shiftArray = makeArray();
  const shiftStart = performance.now();
  while (shiftArray.length) shiftArray.shift();
  const shiftTime = performance.now() - shiftStart;
  results.shift.push(shiftTime);

  const popArray = makeArray();
  const popStart = performance.now();
  while (popArray.length) popArray.pop();
  const popTime = performance.now() - popStart;
  results.pop.push(popTime);

  logger.info({ shiftTime, popTime });
}

Object.entries(results).forEach(([key, times]) => {
  const min = Math.min(...times);
  const max = Math.max(...times);
  const total = Math.max(...times);
  const avg = total / (times.length || 1);
  logger.success({ key, min, max, avg });
});
