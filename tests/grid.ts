import { Grid } from '@/lib/grid.0.ts';
import { Logger } from '@/lib/logger.0.ts';

const logger = new Logger(import.meta.url, 'main');
// const rows = 3;
// const cols = 5;

// const gridXy = new Grid('xy', { rows, cols }, () => Math.round(Math.random() * 9));
// logger.info(gridXy);

// for (let a = 0; a < Math.max(rows, cols); ++a) {
//   const x = Math.min(a, cols - 1);
//   const y = Math.min(a, rows - 1);
//   const i = gridXy.coordToIndex(x, y);
//   const coord = gridXy.indexToCoord(i);
//   const val = gridXy.get(x, y);
//   logger.info({ x, y, i, coord, val });
// }

// const gridRc = new Grid('rc', { rows, cols }, () => Math.round(Math.random() * 9));
// logger.info(gridRc);

// for (let a = 0; a < Math.max(rows, cols); ++a) {
//   const r = Math.min(a, rows - 1);
//   const c = Math.min(a, cols - 1);
//   const i = gridRc.coordToIndex(r, c);
//   const coord = gridRc.indexToCoord(i);
//   const val = gridRc.get(r, c);
//   logger.info({ r, c, i, coord, val });
// }

const results = { xy: { throws: 0, invalid: 0, ok: 0 }, rc: { throws: 0, invalid: 0, ok: 0 } };
for (let run = 0; run < 100; ++run) {
  const rows = Math.round(Math.random() * 1000);
  const cols = Math.round(Math.random() * 1000);
  logger.info({ run, rows, cols });
  const gridXy = new Grid('xy', { rows, cols }, () => 0);
  let xyOk = true;
  for (let x = 0; x < cols; ++x) {
    for (let y = 0; y < rows; ++y) {
      try {
        const prev = gridXy.get(x, y);
        const next = gridXy.set(x, y, 1);
        const i = gridXy.coordToIndex(x, y);
        const coord = gridXy.indexToCoord(i);
        if (prev !== 0 || next !== 1 || coord.x !== x || coord.y !== y || coord.i !== i) {
          logger.error({ run }, 'gridXy', { x, y, prev, next, i, coord });
          ++results.xy.invalid;
          xyOk = false;
        }
      } catch (err) {
        logger.error({ run }, 'gridXy', { x, y }, err);
        ++results.xy.throws;
        xyOk = false;
      }
    }
  }
  if (xyOk) ++results.xy.ok;
  const gridRc = new Grid('rc', { rows, cols }, () => 0);
  let rcOk = true;
  for (let r = 0; r < rows; ++r) {
    for (let c = 0; c < cols; ++c) {
      try {
        const prev = gridRc.get(r, c);
        const next = gridRc.set(r, c, 1);
        const i = gridRc.coordToIndex(r, c);
        const coord = gridRc.indexToCoord(i);
        if (prev !== 0 || next !== 1 || coord.r !== r || coord.c !== c || coord.i !== i) {
          logger.error({ run }, 'gridRc', { r, c, prev, next, i, coord });
          ++results.rc.invalid;
          rcOk = false;
        }
      } catch (err) {
        logger.error({ run }, 'gridRc', { r, c }, err);
        ++results.rc.throws;
        rcOk = false;
      }
    }
  }
  if (rcOk) ++results.rc.ok;
}

logger[Object.values(results).some((val) => val.invalid || val.throws) ? 'error' : 'success'](results);
