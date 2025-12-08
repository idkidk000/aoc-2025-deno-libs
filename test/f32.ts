import { Logger } from '@/logger.0.ts';

const logger = new Logger(import.meta.url);
const f32 = new Float32Array(1);
let lower: number | null = null;
let upper: number | null = null;
for (let i = 0; true; ++i) {
  if (lower === null) {
    f32[0] = -i;
    if (f32[0] !== -i) lower = -i + 1;
  }
  if (upper === null) {
    f32[0] = i;
    if (f32[0] !== i) upper = i - 1;
  }
  if (lower !== null && upper !== null) break;
}
logger.info({ lower, upper });
