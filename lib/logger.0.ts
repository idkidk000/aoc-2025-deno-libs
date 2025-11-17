// DONE

import { Console } from 'node:console';
import { relative, sep } from 'node:path';
import { cwd, stderr, stdout } from 'node:process';
import { fileURLToPath } from 'node:url';

const MAX_PATH_DEPTH = 3;

export const ansiStyles = {
  fg: {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    purple: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
  },
  fgIntense: {
    black: '\x1b[90m',
    red: '\x1b[91m',
    green: '\x1b[92m',
    yellow: '\x1b[93m',
    blue: '\x1b[94m',
    purple: '\x1b[95m',
    cyan: '\x1b[96m',
    white: '\x1b[97m',
  },
  bg: {
    black: '\x1b[40m',
    red: '\x1b[41m',
    green: '\x1b[42m',
    yellow: '\x1b[43m',
    blue: '\x1b[44m',
    purple: '\x1b[45m',
    cyan: '\x1b[46m',
    white: '\x1b[47m',
  },
  bgIntense: {
    black: '\x1b[100m',
    red: '\x1b[101m',
    green: '\x1b[102m',
    yellow: '\x1b[103m',
    blue: '\x1b[104m',
    purple: '\x1b[105m',
    cyan: '\x1b[106m',
    white: '\x1b[107m',
  },
  bold: '\x1b[1m',
  underline: '\x1b[4m',
  reset: '\x1b[0m',
} as const;

const levels = {
  'Debug:High': { colour: ansiStyles.fgIntense.blue, method: 'debug', value: 0 },
  'Debug:Med': { colour: ansiStyles.fgIntense.blue, method: 'debug', value: 1 },
  'Debug:Low': { colour: ansiStyles.fgIntense.blue, method: 'debug', value: 2 },
  'Info': { colour: ansiStyles.fgIntense.cyan, method: 'info', value: 3 },
  'Success': { colour: ansiStyles.fgIntense.green, method: 'info', value: 4 },
  'Warn': { colour: ansiStyles.fgIntense.yellow, method: 'warn', value: 5 },
  'Error': { colour: ansiStyles.fgIntense.red, method: 'error', value: 6 },
} as const;
type LevelName = keyof typeof levels;

const console = new Console({
  colorMode: true,
  inspectOptions: { breakLength: 300, depth: 10, maxStringLength: 150, numericSeparator: true, sorted: false },
  stderr,
  stdout,
});

export enum LogDate {
  None,
  Time,
  DateTime,
}

export class Logger {
  #name: string;
  #levelValue: number;
  #logDate: LogDate;
  #makePrefix(levelName: LevelName, colour: string) {
    if (this.#logDate === LogDate.None) return `${ansiStyles.bold}${colour}[${levelName} ${this.#name}]${ansiStyles.reset}`;
    const now = new Date();
    if (this.#logDate === LogDate.Time) {
      return `${ansiStyles.bold}${colour}[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${
        now.getSeconds().toString().padStart(2, '0')
      }.${now.getMilliseconds().toString().padStart(3, '0')} ${levelName} ${this.#name}]${ansiStyles.reset}`;
    }
    return `${ansiStyles.bold}${colour}[${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${
      now.getHours().toString().padStart(2, '0')
    }:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${
      now.getMilliseconds().toString().padStart(3, '0')
    } ${levelName} ${this.#name}]${ansiStyles.reset}`;
  }
  #log(levelName: LevelName, ...message: unknown[]) {
    const { colour, method, value } = levels[levelName];
    if (value < this.#levelValue) return;
    const prefix = this.#makePrefix(levelName, colour);
    console[method](prefix, ...message);
  }
  constructor(
    importMetaUrl: string,
    name?: string,
    { logLevel = 'Debug:High', logDate = LogDate.None }: { logLevel?: LevelName | number; logDate?: LogDate } = {},
  ) {
    this.#name = `${relative(cwd(), fileURLToPath(importMetaUrl)).split(sep).slice(-MAX_PATH_DEPTH).join(sep)}:${name ?? 'main'}`;
    this.#levelValue = (typeof logLevel === 'number') ? this.#levelValue = logLevel : levels[logLevel].value;
    this.#logDate = logDate;
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
