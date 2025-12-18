import { Deque } from '@/deque.0.ts';
import { LinkedList } from '@/linked-list.0.ts';
import { Logger } from '@/logger.0.ts';

const count = 10_000_000;
const classNames = [
  'LinkedList',
  'Deque',
  'Array',
] as const;
const testNames = ['pushFront', 'pushBack', 'popFront', 'popBack', 'delete', 'insert'] as const;
type ClassName = (typeof classNames)[number];
type TestName = (typeof testNames)[number];
type ClassTimes = Record<TestName, number | false>;
const globalTimes: Partial<Record<ClassName, ClassTimes>> = {};
const logger = new Logger(import.meta.url);

for (const className of classNames) {
  const times: Partial<ClassTimes> = {};
  for (const testName of testNames) {
    const obj = className === 'Array'
      ? new Array<number>()
      : className === 'Deque'
      ? new Deque<number>()
      : className === 'LinkedList'
      ? new LinkedList<number>()
      : null;
    if (obj === null) throw new Error(`unhandled className ${className}`);
    let started = performance.now();
    let pass = true;
    switch (testName) {
      case 'pushFront': {
        // i don't have the patience for Array.prototype.unshift
        if (className === 'Array') pass = false;
        if (className === 'Deque') { for (let i = 0; i < count; ++i) (obj as Deque<number>).pushFront(i); }
        if (className === 'LinkedList') { for (let i = 0; i < count; ++i) (obj as LinkedList<number>).pushFront(i); }
        break;
      }
      case 'pushBack': {
        if (className === 'Array') { for (let i = 0; i < count; ++i) (obj as Array<number>).push(i); }
        if (className === 'Deque') { for (let i = 0; i < count; ++i) (obj as Deque<number>).pushBack(i); }
        if (className === 'LinkedList') { for (let i = 0; i < count; ++i) (obj as LinkedList<number>).pushBack(i); }
        break;
      }
      case 'popFront': {
        // i don't have the patience for Array.prototype.shift
        if (className === 'Array') pass = false;
        if (className === 'Deque') { for (let i = 0; i < count; ++i) (obj as Deque<number>).pushBack(i); }
        if (className === 'LinkedList') { for (let i = 0; i < count; ++i) (obj as LinkedList<number>).pushBack(i); }
        started = performance.now();
        if (className === 'Deque') { for (let i = 0; i < count; ++i) (obj as Deque<number>).popFront(); }
        if (className === 'LinkedList') { for (let i = 0; i < count; ++i) (obj as LinkedList<number>).popFront(); }
        break;
      }
      case 'popBack': {
        if (className === 'Array') { for (let i = 0; i < count; ++i) (obj as Array<number>).push(i); }
        if (className === 'Deque') { for (let i = 0; i < count; ++i) (obj as Deque<number>).pushBack(i); }
        if (className === 'LinkedList') { for (let i = 0; i < count; ++i) (obj as LinkedList<number>).pushBack(i); }
        started = performance.now();
        if (className === 'Array') { for (let i = 0; i < count; ++i) (obj as Array<number>).pop(); }
        if (className === 'Deque') { for (let i = 0; i < count; ++i) (obj as Deque<number>).popBack(); }
        if (className === 'LinkedList') { for (let i = 0; i < count; ++i) (obj as LinkedList<number>).popBack(); }
        break;
      }
      case 'delete': {
        // i don't have the patience for Array.prototype.splice
        if (className === 'Array') pass = false;
        if (className === 'Deque') pass = false;
        if (className === 'LinkedList') { for (let i = 0; i < count; ++i) (obj as LinkedList<number>).pushBack(i); }
        started = performance.now();
        // deno-lint-ignore no-non-null-assertion
        if (className === 'LinkedList') { for (let i = 0; i < count; ++i) (obj as LinkedList<number>).delete((obj as LinkedList<number>).front!); }
        break;
      }
      case 'insert': {
        // i don't have the patience for Array.prototype.splice
        if (className === 'Array') pass = false;
        if (className === 'Deque') pass = false;
        if (className === 'LinkedList') (obj as LinkedList<number>).pushBack(1, 2, 3, 4, 5, 6, 7, 8, 9);
        started = performance.now();
        if (className === 'LinkedList') {
          const item = (obj as LinkedList<number>).find((v) => v.data === 5);
          if (!item) throw new Error('could not find item');
          for (let i = 0; i < count; ++i) (obj as LinkedList<number>).insertBefore(item, i);
        }
        break;
      }
      default:
        throw new Error(`unhandled testName ${testName}`);
    }
    const result = pass ? performance.now() - started : pass;
    times[testName] = result;
    logger.info(className, testName, result);
  }
  globalTimes[className] = times as ClassTimes;
}
logger.success(globalTimes);
