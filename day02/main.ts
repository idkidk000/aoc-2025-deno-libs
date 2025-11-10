import { Logger } from '@/lib/logger.ts';
import { Util } from '@/lib/util.ts';
import { Mutex } from 'async-mutex';
import { release } from 'node:os';

const logger = new Logger(import.meta.url, 'part1');
const util = new Util(123);
const mutex = new Mutex();
await mutex.acquire();
try {
  logger.success('day02', util);
} finally {
  release();
}
logger.info('released');
