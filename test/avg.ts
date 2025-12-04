import { Logger } from '@/lib/logger.0.ts';
import { Utils } from '@/lib/utils.0.ts';

const input = [1, 1, 2, 2, 2, 3, 3, 3, 99];
const logger = new Logger(import.meta.url);

for (const method of ['mean', 'median', 'mode'] as const)
  logger.info(method, Utils[method](...input));
