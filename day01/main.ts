import { parseArgs } from '@/lib/args.ts';
import { Logger } from '@/lib/logger.ts';

function part1(data: string, logger: Logger) {
  logger.success('fin', data);
}

function part2(data: string, logger: Logger) {
  logger.success('fin', data);
}

function main() {
  const logger = new Logger(import.meta.url, 'main');
  const { data, fileName, logLevel, part } = parseArgs(import.meta.url);
  logger.debugLow({ fileName, logLevel, part });
  if (part !== 2) part1(data, new Logger(import.meta.url, 'part1', { logLevel }));
  if (part !== 1) part2(data, new Logger(import.meta.url, 'part2', { logLevel }));
}

main();
