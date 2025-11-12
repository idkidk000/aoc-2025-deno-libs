import { parseArgs } from '@/lib/args.0.ts';
import { Logger } from '@/lib/logger.0.ts';
import { Point2 } from '@/lib/point2.0.ts';

function part1(data: string, logger: Logger) {
/*   // const grid = new Grid({ rows: 3, cols: 4, fill: 1 });
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

  const v0 = new Point2(3, 5);
  const v1 = new Point2(-1, 4);
  logger.debugLow({
    v0,
    v1,
    add: v0.add(v1),
    sub: v0.subtract(v1),
    mult: v0.multiply(v1),
    multn: v0.multiply(5),
    dist2: v0.distance2(v1),
    dist2r: v1.distance2(v0),
    dist: v0.distance(v1),
    manhattan: v0.manhattan(v1),
  });
  const { inBounds, pack, unpack, packBigInt, unpackBigInt } = Point2.makeUtils(-10, 10, -10, 10);
  for (const offset of Point2.makeOffsets(8)) {
    const value = v0.add(offset.multiply(6));
    const packed = pack(value);
    const unpacked = unpack(packed);
    const packedBig=packBigInt(value)
    const unpackedBig=unpackBigInt(packedBig)
    logger.debugLow({ offset, value, inBounds: inBounds(value), packed, unpacked, equal: unpacked.equals(value),packedBig,unpackedBig,equalBig:unpackedBig.equals(value) });
  } */

  // const points=Array.from({length:10},()=>[
  //   new Point2(Math.round(Math.random()*20)-10,Math.round(Math.random()*20)-10,),
  //   new Point2(Math.round(Math.random()*20)-10,Math.round(Math.random()*20)-10,),
  // ])

  let count=0
  for (let i=0;true;++i) {
    const points=Array.from({length:100},()=>new Point2(
      Math.round((Math.random()*i)-(i/2)),
      Math.round((Math.random()*i)-(i/2)),
    ))
    const bounds=Point2.getBounds(points)
    const utils=Point2.makeUtils(bounds)
    const mapped=points.map((point)=>{
      const packed=utils.pack(point)
      const unpacked=utils.unpack(packed)
      const equal=unpacked.equals(point)
      const packedBig=utils.packBigInt(point)
      const unpackedBig=utils.unpackBigInt(packedBig)
      const equalBig=unpackedBig.equals(point)
      return {
        point,
        packed,
        unpacked,
        equal,
        packedBig,
        unpackedBig,
        equalBig
      }
    })
    const failed=mapped.filter(({equal,equalBig})=>!(equal && equalBig))
    if (failed.length===0) {
      count+=mapped.length
      logger.debugLow(count, bounds)
    }
    else {
      logger.error(bounds, failed)
      throw new Error('unpacked not equal')
    }
  }
}

function part2(data: string, logger: Logger) {
  const points=Array.from({length:10},()=>new Point2(
    Math.round(Math.random()*10)-5,
    Math.round(Math.random()*10)-5
  ))
  const bounds=Point2.getBounds(points)
  const utils=Point2.makeUtils(bounds)
  logger.debugLow(bounds)
  for (const point of points) {
      const packed=utils.pack(point)
      const unpacked=utils.unpack(packed)
      const equal=unpacked.equals(point)
      const packedBig=utils.packBigInt(point)
      const unpackedBig=utils.unpackBigInt(packedBig)
      const equalBig=unpackedBig.equals(point)
      if (equal && equalBig ) logger.debugLow({point,packed,unpacked,equal,packedBig,unpackedBig,equalBig})
        else logger.error({point,packed,unpacked,equal,packedBig,unpackedBig,equalBig})
  }
}

function main() {
  const logger = new Logger(import.meta.url, 'main');
  const { data, fileName, logLevel, part } = parseArgs(import.meta.url);
  logger.debugLow({ fileName, logLevel, part });
  if (part !== 2) part1(data, new Logger(import.meta.url, 'part1', { logLevel }));
  if (part !== 1) part2(data, new Logger(import.meta.url, 'part2', { logLevel }));
}

main();
