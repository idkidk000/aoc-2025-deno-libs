import { parseArgs } from '@/lib/args.0.ts';
import { Logger } from '@/lib/logger.0.ts';
import { Grid } from '@/lib/grid.0.ts';
import { Vec2 } from '@/lib/vector.0.ts';

function part1(data: string, logger: Logger) {
  // const grid = new Grid({ rows: 3, cols: 4, fill: 1 });
  // const grid=new Grid(data.split('\n').map((line)=>line.split('')))
  // const grid = new Grid({ rows: 3, cols: 5, fill: (x: number, y: number) => (x + y) % 10 });
  const grid = new Grid({ rows: 3, cols: 5, fill: (x: number, y: number) => ({ x, y }) });
  logger.debugLow(grid);
  logger.debugLow('counts', grid.rowCount, grid.colCount);
  logger.debugLow('getValue', grid.getValue(1, 2));
  // grid.setValue(1,2,'x')
  // grid.setValue(1, 2, 999);
  logger.debugLow('getValue', grid.getValue(1, 2));
  logger.debugLow(grid);
  logger.debugLow('rows', grid.rows);
  logger.debugLow('cols', grid.cols);
  const find = grid.find((value) => value.x === 4);
  logger.debugLow({ find });

  const v0 = new Vec2(3, 5);
  const v1 = new Vec2(-1, 4);
  logger.debugLow({ v0, v1, add: v0.add(v1), sub: v0.sub(v1), mult: v0.mult(v1) });
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
