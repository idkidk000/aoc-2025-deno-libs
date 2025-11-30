import { CoordSystem, Grid } from '@/lib/grid.0.ts';
import { Logger } from '@/lib/logger.0.ts';
import { Offset2D, Point2D } from '@/lib/point2d.0.ts';

const logger = new Logger(import.meta.url);
const size = 15;
const point = new Point2D({ x: size + 1, y: size + 1 });

const grid = new Grid({ rows: size * 2 + 3, cols: size * 2 + 3, fill: () => '.' }, CoordSystem.Xy, (c) => ` ${c}`);

for (const key of Object.keys(Offset2D).filter((key) => isNaN(parseInt(key)))) {
  grid.clear('.');
  for (const n of point.neighbours(size, Offset2D[key as keyof typeof Offset2D])) grid.cellSet(n, '#');
  logger.info(key, grid);
}
