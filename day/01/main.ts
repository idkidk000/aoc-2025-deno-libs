import { AocArgParser, EcArgParser } from '@/lib/args.1.ts';
import { Logger } from '@/lib/logger.0.ts';

function part1(_data: string, _logger: Logger) {
}

function part2(_data: string, _logger: Logger) {
}

function main() {
  const { data, logger, part } = new EcArgParser(import.meta.url);
  logger.info({ data, part });
  if (part !== 2) part1(data, logger.makeChild('part1'));
  if (part !== 1) part2(data, logger.makeChild('part2'));
}

main();
