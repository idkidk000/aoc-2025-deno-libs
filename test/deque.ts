import { ansiStyles, Logger } from '@/lib/logger.0.ts';
import { MathsUtils } from '@/lib/maths-utils.0.ts';
import { Deque, DequeDelete } from '@/lib/deque.0.ts';

const logger = new Logger(import.meta.url);
const runs = 10;
const length = Deno.args.includes('-vfast') ? 10 : Deno.args.includes('-fast') ? 10_000 : 1_000_000;

const tests = ['backBack', 'backFront', 'frontBack', 'frontFront'] as const;
type Test = (typeof tests)[number];
const results: Record<Test, { push: number; pop: number; iter: number; iterPass: boolean; popPass: boolean }[]> = {
  backBack: [],
  backFront: [],
  frontBack: [],
  frontFront: [],
};

for (let run = 0; run < runs; ++run) {
  const input = Array.from({ length }, (_, i) => i);
  for (const test of tests) {
    const deque = new Deque<number>(undefined, { deleteStrategy: DequeDelete.None });
    const pushStarted = performance.now();
    if (test === 'backBack' || test === 'backFront') { for (const item of input) deque.pushBack(item); }
    else if (test === 'frontBack' || test === 'frontFront') { for (const item of input) deque.pushFront(item); }
    const pushTime = performance.now() - pushStarted;

    let iterOutput: number[];
    const iterStarted = performance.now();
    if (test === 'backBack' || test === 'frontBack') iterOutput = deque.itemsBack().toArray();
    else if (test === 'backFront' || test === 'frontFront') iterOutput = deque.itemsFront().toArray();
    else iterOutput = [];
    const iterTime = performance.now() - iterStarted;

    const iterPass = iterOutput.length === input.length && (
      test === 'backBack' || test === 'frontFront'
        ? iterOutput.toReversed().every((item, i) => input[i] === item)
        : test === 'backFront' || test === 'frontBack'
        ? iterOutput.every((item, i) => input[i] === item)
        : false
    );

    const popOutput: number[] = [];
    const popStarted = performance.now();
    // deno-lint-ignore no-non-null-assertion
    if (test === 'backBack' || test === 'frontBack') { while (deque.size) popOutput.push(deque.popBack()!); }
    // deno-lint-ignore no-non-null-assertion
    else if (test === 'backFront' || test === 'frontFront') { while (deque.size) popOutput.push(deque.popFront()!); }
    const popTime = performance.now() - popStarted;

    const popPass = popOutput.length === input.length && (
      test === 'backBack' || test === 'frontFront'
        ? popOutput.toReversed().every((item, i) => input[i] === item)
        : test === 'backFront' || test === 'frontBack'
        ? popOutput.every((item, i) => input[i] === item)
        : false
    );

    logger.info({ run, test, push: MathsUtils.roundTo(pushTime), iter: MathsUtils.roundTo(iterTime), pop: MathsUtils.roundTo(popTime), iterPass });
    results[test].push({ iter: iterTime, iterPass, pop: popTime, push: pushTime, popPass });
  }
}

for (const [test, testData] of Object.entries(results)) {
  const lengthPass = testData.length > 0;
  const iterPass = testData.every(({ iterPass }) => iterPass);
  const popPass = testData.every(({ popPass }) => popPass);

  const pass = lengthPass && iterPass && popPass;
  logger.info(
    `${ansiStyles.bold}${test} ${pass ? `${ansiStyles.fgIntense.green}PASS` : `${ansiStyles.fgIntense.red}FAIL`}${ansiStyles.reset}`,
    ...[['length', lengthPass], ['iter', iterPass], ['pop', popPass]].map(([label, value]) =>
      `${value ? ansiStyles.fg.green : ansiStyles.fg.red}${label}${ansiStyles.reset}`
    ),
  );
  for (const operation of ['push', 'iter', 'pop'] as const) {
    const times = testData.map((item) => item[operation]);
    const [min, max] = MathsUtils.minMax(...times).map(MathsUtils.roundTo);
    const avg = MathsUtils.roundTo(MathsUtils.avg(...times));
    logger.info(`  ${operation}`, { min, max, avg });
  }
}
