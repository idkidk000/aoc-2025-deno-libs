import { Logger } from '../lib/logger.ts';

const logger = new Logger(import.meta.url, 'part1');
logger.debugHigh('debugHigh', logger);
logger.debugMed('debugMed', logger);
logger.debugLow('debugLow', logger);
logger.info('info', logger);
logger.success('success', logger);
logger.warn('warn', logger);
logger.error('error', logger);
logger.setLevel('Info');
logger.debugHigh('debugHigh', logger);
logger.debugMed('debugMed', logger);
logger.debugLow('debugLow', logger);
logger.info('info', logger);
logger.success('success', logger);
logger.warn('warn', logger);
logger.error('error', logger);
