import { parseArgs } from '@/lib/args.0.ts';
import { Logger } from '@/lib/logger.0.ts';
import { Point2 } from '@/lib/point2.0.ts';
import { HashSet } from '../lib/hashset.0.ts';

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

  let count = 0;
  for (let i = 0; true; ++i) {
    const x = i ** 2;
    const y = (i - 1) ** 2;
    const points = Array.from({ length: 5 }, () =>
      new Point2(
        (Math.random() * x  - (x / 2) ),
        (Math.random() * y  - (y / 2) ),
      ));
    // const bounds = Point2.getBounds(points);
    // const utils = Point2.makeUtils(bounds);
    const mapped = points.map((point) => {
      // const packedInt = utils.packInt(point);
      // const unpackedInt = utils.unpackInt(packedInt);
      // const equalInt = unpackedInt.eq(point);
      // const packedBig = utils.packBigInt(point);
      // const unpackedBig = utils.unpackBigInt(packedBig);
      // const equalBig = unpackedBig.eq(point);
      const packed = Point2.pack(point);
      const unpacked = Point2.unpack(packed);
      const equal = unpacked.eq(point);
      return {
        point,
        // packedInt,
        // unpackedInt,
        // equalInt,
        // packedBig,
        // unpackedBig,
        // equalBig,
        packed,
        unpacked,
        equal,
      };
    });
    const failed = mapped.filter(({  equal }) => !( equal));
    // const maxVal = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
    // const overflow = maxVal > Number.MAX_SAFE_INTEGER;
    if (failed.length === 0) {
      count += mapped.length;
      logger.debugLow(count,  );
    } else {
      logger.error( failed, );
      throw new Error('unpacked not equal');
    }
  }
}

function part2(data: string, logger: Logger) {
  const times:Record<'int'|'big'|'main',Record<'pack'|'unpack',number[]>>={
    int:{pack:[],unpack:[]},
    big:{pack:[],unpack:[]},
    main:{pack:[],unpack:[]}
  }
  for (let i=0;i<10;++i) {
    const points=Array.from({length:1_000_000},()=>new Point2(Math.round((Math.random()*100)-50),Math.round((Math.random()*100)-50),))
    const bounds=Point2.getBounds(points)
    const utils=Point2.makeUtils(bounds)

    const intPackStart=Date.now()
    const intSet=new HashSet(utils.packInt,points)
    const intPackTime=Date.now()-intPackStart
    times.int.pack.push(intPackTime)
    logger.info('intPack',{i}, intPackTime.toLocaleString(),'ms')

    const intUnpackStart=Date.now()
    const intUnpacked=intSet.internal.keys().map(utils.unpackInt).toArray()
    const intUnpackTime=Date.now()-intUnpackStart
    times.int.unpack.push(intUnpackTime)
    logger.info('intUnpack',{i}, intUnpackTime.toLocaleString(),'ms')
    //TODO: test that intUnpacked matches points

    const bigPackStart=Date.now()
    const bigSet=new HashSet(utils.packBigInt,points)
    const bigPackTime=Date.now()-bigPackStart
    times.big.pack.push(bigPackTime)
    logger.info('bigPack',{i},bigPackTime.toLocaleString(),'ms')

    const bigUnpackStart=Date.now()
    const bigUnpacked=bigSet.internal.keys().map(utils.unpackBigInt).toArray()
    const bigUnpackTime=Date.now()-bigUnpackStart
    times.big.unpack.push(bigUnpackTime)
    logger.info('bigUnpack',{i},bigPackTime.toLocaleString(),'ms')

    const mainPackStart=Date.now()
    const mainSet=new HashSet(Point2.pack,points)
    const mainPackTime=Date.now()-mainPackStart
    times.main.pack.push(mainPackTime)
    logger.info('mainPack',{i},mainPackTime.toLocaleString(),'ms')
    const mainUnpackStart=Date.now()
    const mainUnpacked=mainSet.internal.keys().map(Point2.unpack).toArray()
    const mainUnpackTime=Date.now()-mainUnpackStart
    times.main.unpack.push(mainUnpackTime)
    logger.info('mainUnpack',{i},mainUnpackTime.toLocaleString(),'ms')

  }

  Object.entries(times).forEach(([key,data])=>
    Object.entries(data).forEach(([test,times])=>{
      const min=Math.min(...times)
      const max=Math.max(...times)
      const total=times.reduce((acc,item)=>acc+item,0)
      const avg=total/(times.length||1)
      logger.info({key,test,min,max,total,avg})
    })
  )


}

function main() {
  const logger = new Logger(import.meta.url, 'main');
  const { data, fileName, logLevel, ...args } = parseArgs(import.meta.url);
  logger.debugLow({ fileName, logLevel, ...args });
  if (args.part1) part1(data, new Logger(import.meta.url, 'part1', { logLevel }));
  if (args.part2) part2(data, new Logger(import.meta.url, 'part2', { logLevel }));
}

main();
