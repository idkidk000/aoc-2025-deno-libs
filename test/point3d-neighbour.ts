import { CoordSystem, Grid } from '@/lib/grid.0.ts';
import { Logger } from '@/lib/logger.0.ts';
import { Offset3D, Point3D } from '@/lib/point3d.0.ts';
import { Utils } from '../lib/utils.0.ts';

const logger = new Logger(import.meta.url);
const size = 3;
const point = new Point3D({ x: size + 1, y: size + 1, z: size + 1 });
const grid = new Grid({ rows: size * 2 + 3, cols: size * 2 + 3, fill: () => '.' }, CoordSystem.Xy, (c) => ` ${c}`);

for (const key of Object.keys(Offset3D).filter((key) => isNaN(parseInt(key)))) {
  const neighbours = point.neighbours(size, Offset3D[key as keyof typeof Offset3D]);
  const slices = Utils.groupBy(neighbours, ({ z }) => z);
  for (const [z, slice] of slices.entries().toArray().toSorted(([a], [b]) => a - b)) {
    grid.fill('.');
    for (const item of slice) grid.cellSet(item, '#');
    logger.info(key, { z }, grid);
  }
}
