import { Logger } from '../lib/logger.0.ts';
import { MathsUtils } from '../lib/maths-utils.0.ts';
import { ansiStyles } from '../lib/misc.0.ts';
import { Deque } from '../lib/deque.0.ts';

const logger = new Logger(import.meta.url);
const runs = 10;
const length = Deno.args.includes('-vfast') ? 10 : Deno.args.includes('-fast') ? 10_000 : 1_000_000;

const tests = ['backBack', 'backFront', 'frontBack', 'frontFront'] as const;
type Test = (typeof tests)[number];
const results: Record<Test, { write: number; read: number; pass: boolean }[]> = {
  backBack: [],
  backFront: [],
  frontBack: [],
  frontFront: [],
};

for (let run = 0; run < runs; ++run) {
  const input = Array.from({ length }, (_, i) => i);
  for (const test of tests) {
    const perfDeque = new Deque<number>();
    const writeStarted = performance.now();
    if (test === 'backBack' || test === 'backFront') { for (const item of input) perfDeque.pushBack(item); }
    else if (test === 'frontBack' || test === 'frontFront') { for (const item of input) perfDeque.pushFront(item); }
    const writeTime = performance.now() - writeStarted;

    const readStarted = performance.now();
    if (test === 'backBack' || test === 'frontBack') { while (perfDeque.size) perfDeque.popBack(); }
    else if (test === 'backFront' || test === 'frontFront') { while (perfDeque.size) perfDeque.popFront(); }
    const readTime = performance.now() - readStarted;

    const dateDeque = new Deque<number>();
    if (test === 'backBack' || test === 'backFront') { for (const item of input) dateDeque.pushBack(item); }
    else if (test === 'frontBack' || test === 'frontFront') { for (const item of input) dateDeque.pushFront(item); }

    const output: number[] = [];
    // deno-lint-ignore no-non-null-assertion
    if (test === 'backBack' || test === 'frontBack') { while (dateDeque.size) output.push(dateDeque.popBack()!); }
    // deno-lint-ignore no-non-null-assertion
    else if (test === 'backFront' || test === 'frontFront') { while (dateDeque.size) output.push(dateDeque.popFront()!); }

    const pass = output.length === input.length && (
      test === 'backBack' || test === 'frontFront'
        ? output.toReversed().every((item, i) => input[i] === item)
        : test === 'backFront' || test === 'frontBack'
        ? output.every((item, i) => input[i] === item)
        : false
    );

    logger.info({ run, test, write: MathsUtils.roundTo(writeTime), read: MathsUtils.roundTo(readTime), pass });
    results[test].push({ pass, read: readTime, write: writeTime });
  }
}

for (const [test, testData] of Object.entries(results)) {
  const pass = testData.length && testData.every(({ pass }) => pass);
  // deno-lint-ignore no-console
  console.log(`${ansiStyles.bold}${test} ${pass ? `${ansiStyles.fgIntense.green}PASS` : `${ansiStyles.fgIntense.red}FAIL`}${ansiStyles.reset}`);
  for (const operation of ['read', 'write'] as const) {
    const times = testData.map((item) => item[operation]);
    const min = MathsUtils.roundTo(Math.min(...times));
    const max = MathsUtils.roundTo(Math.max(...times));
    const total = times.reduce((acc, item) => acc + item, 0);
    const avg = MathsUtils.roundTo(total / (times.length || 1));
    // deno-lint-ignore no-console
    console.log(`  ${operation}`, { min, max, avg });
  }
}
