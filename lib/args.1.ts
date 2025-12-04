import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Logger } from '@/lib/logger.0.ts';

abstract class ArgParser {
  protected abstract _fileName: string;
  protected abstract _logger: Logger;
  protected abstract _part: number;
  protected abstract _importMetaUrl: string;
  get fileName() {
    return this._fileName;
  }
  get logger() {
    return this._logger;
  }
  get data(): string {
    const filePath = join(dirname(fileURLToPath(this._importMetaUrl)), this._fileName);
    return readFileSync(filePath, { encoding: 'utf-8' });
  }
  get part() {
    return this._part;
  }
}

type ArgParserDefaults = { fileName: string; logLevel: number; part: number };

/** Parses the following args:
 * - `-f` `fileName` loads puzzle input from `fileName(\.txt)?`. Default `input.txt`
 * - `-l` `logLevel` sets log level from `0` - `Debug:High` to `6` - `Error`. Default `3` - `Info`
 * - `-p` `part` selects which part of the puzzle to run - `1` is `part1`, `2` is `part2`, other is `both`. Default `0`
 */
export class AocArgParser extends ArgParser {
  protected _fileName: string;
  protected _logger: Logger;
  protected _part: number;
  protected _importMetaUrl: string;
  constructor(importMetaUrl: string, defaults?: Partial<ArgParserDefaults>) {
    super();
    const args = [...Deno.args].toReversed();
    const parsed: ArgParserDefaults = {
      fileName: 'input.txt',
      logLevel: 3,
      part: 1,
      ...defaults,
    };
    while (args.length) {
      const key = args.pop();
      if (typeof key === 'undefined') break;
      if (!['-f', '-l', '-p'].includes(key)) throw new Error(`unknown arg ${key}`);
      const val = args.pop();
      if (typeof val === 'undefined') throw new Error(`missing value for arg ${key}`);
      if (key === '-f') parsed.fileName = `${val.replace(/\.txt$/, '')}.txt`;
      if (key === '-l') parsed.logLevel = parseInt(val);
      if (key === '-p') parsed.part = parseInt(val);
    }
    this._fileName = parsed.fileName;
    this._logger = new Logger(importMetaUrl, undefined, { logLevel: parsed.logLevel });
    this._part = parsed.part;
    this._importMetaUrl = importMetaUrl;
  }
}

/** Parses the following args:
 * - `-f` `fileName` loads puzzle input from `fileName(\.txt)?`. Default `part${part}.txt`
 * - `-l` `logLevel` sets log level from `0` - `Debug:High` to `6` - `Error`. Default `3` - `Info`
 * - `-p` `part` selects which part of the puzzle to run - `1` is `part1`, etc. Default `1`
 */
export class EcArgParser extends ArgParser {
  protected _fileName: string;
  protected _logger: Logger;
  protected _part: number;
  protected _importMetaUrl: string;
  constructor(importMetaUrl: string, defaults?: Partial<ArgParserDefaults>) {
    super();
    const args = [...Deno.args].toReversed();
    const parsed: Omit<ArgParserDefaults, 'fileName'> & { fileName?: string } = {
      logLevel: 3,
      part: 1,
      ...defaults,
    };
    while (args.length) {
      const key = args.pop();
      if (typeof key === 'undefined') break;
      if (!['-f', '-l', '-p'].includes(key)) throw new Error(`unknown arg ${key}`);
      const val = args.pop();
      if (typeof val === 'undefined') throw new Error(`missing value for arg ${key}`);
      if (key === '-f') parsed.fileName = `${val.replace(/\.txt$/, '')}.txt`;
      if (key === '-l') parsed.logLevel = parseInt(val);
      if (key === '-p') parsed.part = parseInt(val);
    }
    this._fileName = parsed.fileName ?? `part${parsed.part}.txt`;
    this._logger = new Logger(importMetaUrl, undefined, { logLevel: parsed.logLevel });
    this._part = parsed.part;
    this._importMetaUrl = importMetaUrl;
  }
}
