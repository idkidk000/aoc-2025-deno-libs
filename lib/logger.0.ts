// DONE

import { ansiStyles } from '@/lib/misc.0.ts';
import { Console } from 'node:console';
import { relative, sep } from 'node:path';
import { cwd, stderr, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';

const MAX_PATH_DEPTH = 3;

const levels = {
  'Debug:High': { colour: ansiStyles.blue, method: 'debug', value: 0 },
  'Debug:Med': { colour: ansiStyles.blue, method: 'debug', value: 1 },
  'Debug:Low': { colour: ansiStyles.blue, method: 'debug', value: 2 },
  'Info': { colour: ansiStyles.cyan, method: 'info', value: 3 },
  'Success': { colour: ansiStyles.green, method: 'info', value: 4 },
  'Warn': { colour: ansiStyles.yellow, method: 'warn', value: 5 },
  'Error': { colour: ansiStyles.red, method: 'error', value: 6 },
} as const;
type LevelName = keyof typeof levels;

const console = new Console({
  colorMode: true,
  inspectOptions: { breakLength: 300, depth: 10, maxStringLength: 150, numericSeparator: true, sorted: false },
  stderr,
  stdout,
});

export class Logger {
  #name: string;
  #levelValue: number;
  #log(levelName: LevelName, ...message: unknown[]) {
    const { colour, method, value } = levels[levelName];
    if (value < this.#levelValue) return;
    const now = new Date();
    const prefix = `${ansiStyles.bold}${colour}[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${
      now.getSeconds().toString().padStart(2, '0')
    }.${now.getMilliseconds().toString().padStart(3, '0')} ${levelName} ${this.#name}]${ansiStyles.reset}`;
    console[method](prefix, ...message);
  }
  constructor(importMetaUrl: string, name: string, { logLevel = 'Debug:High' }: { logLevel?: LevelName | number } = {}) {
    this.#name = `${relative(cwd(), fileURLToPath(importMetaUrl)).split(sep).slice(-MAX_PATH_DEPTH).join(sep)}:${name}`;
    this.#levelValue = (typeof logLevel === 'number') ? this.#levelValue = logLevel : levels[logLevel].value;
  }
  public debugHigh(...message: unknown[]) {
    this.#log('Debug:High', ...message);
  }
  public debugMed(...message: unknown[]) {
    this.#log('Debug:Med', ...message);
  }
  public debugLow(...message: unknown[]) {
    this.#log('Debug:Low', ...message);
  }
  public info(...message: unknown[]) {
    this.#log('Info', ...message);
  }
  public success(...message: unknown[]) {
    this.#log('Success', ...message);
  }
  public warn(...message: unknown[]) {
    this.#log('Warn', ...message);
  }
  public error(...message: unknown[]) {
    this.#log('Error', ...message);
  }
  public setLevel(logLevel: LevelName | number) {
    this.#levelValue = (typeof logLevel === 'number') ? this.#levelValue = logLevel : levels[logLevel].value;
  }
}
