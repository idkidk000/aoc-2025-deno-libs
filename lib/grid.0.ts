//DONE

import { inspect } from 'node:util';

interface CoordFull {
  x: number;
  y: number;
  r: number;
  c: number;
  i: number;
}

export class Grid<Cell, System extends 'xy' | 'rc'> {
  #rows: number;
  #cols: number;
  #data: Cell[];
  constructor(system: System, data: Cell[][]);
  constructor(system: System, options: { rows: number; cols: number }, fill: (coord: CoordFull) => Cell);
  constructor(
    public readonly system: System,
    data: Cell[][] | { rows: number; cols: number },
    fill?: (coord: CoordFull) => Cell,
  ) {
    if (Array.isArray(data)) {
      this.#rows = data.length;
      this.#cols = data.length ? data[0].length : 0;
      this.#data = data.flat(1);
    } else if (typeof fill === 'function') {
      this.#rows = data.rows;
      this.#cols = data.cols;
      this.#data = Array.from({ length: data.rows * data.cols }, (_, i) => fill(this.indexToCoord(i)));
    } else { throw new Error('invalid constructor params'); }
  }
  public indexToCoord(i: number): CoordFull {
    const c = i % this.#cols;
    const r = Math.floor(i / this.#cols);
    const x = c;
    const y = this.#rows - r - 1;
    return { x, y, r, c, i };
  }
  public coordToIndex(this: Grid<Cell, 'xy'>, x: number, y: number): number;
  public coordToIndex(this: Grid<Cell, 'rc'>, r: number, c: number): number;
  public coordToIndex(a: number, b: number): number {
    if (this.system === 'rc') {
      const [r, c] = [a, b];
      if (r < 0 || r >= this.#rows || c < 0 || c >= this.#cols) throw new Error(`out of bounds: {r: ${r}, c: ${c}}, rows: ${this.#rows}, cols: ${this.#cols}`);
      const i = (r * this.#cols) + c;
      return i;
    }
    const [x, y] = [a, b];
    if (x < 0 || x >= this.#cols || y < 0 || y >= this.#rows) throw new Error(`out of bounds: {x: ${x}, y: ${y}}, cols: ${this.#cols}, rows: ${this.#rows}`);
    const i = ((this.#rows - y - 1) * this.#cols) + x;
    return i;
  }
  public get(this: Grid<Cell, 'xy'>, x: number, y: number): Cell;
  public get(this: Grid<Cell, 'rc'>, r: number, c: number): Cell;
  public get(a: number, b: number): Cell {
    // @ts-expect-error shush
    return this.#data[this.coordToIndex(a, b)];
  }
  public set(this: Grid<Cell, 'xy'>, x: number, y: number, value: Cell): Cell;
  public set(this: Grid<Cell, 'rc'>, r: number, c: number, value: Cell): Cell;
  public set(a: number, b: number, value: Cell): Cell {
    // @ts-expect-error shush
    return this.#data[this.coordToIndex(a, b)] = value;
  }
  public find(predicate: (value: Cell, coord: CoordFull) => boolean) {
    const index = this.#data.findIndex((value, i) => predicate(value, this.indexToCoord(i)));
    if (index > -1) return { ...this.indexToCoord(index), value: this.#data[index] };
  }
  public findLast(predicate: (value: Cell, coord: CoordFull) => boolean) {
    const index = this.#data.findLastIndex((value, i) => predicate(value, this.indexToCoord(i)));
    if (index > -1) return { ...this.indexToCoord(index), value: this.#data[index] };
  }
  public get rowCount() {
    return this.#rows;
  }
  public get colCount() {
    return this.#cols;
  }
  public get internal() {
    return this.#data;
  }
  public get rows() {
    return Array.from({ length: this.#rows }, (_, row) => this.#data.slice(row * this.#cols, (row + 1) * this.#cols));
  }
  public get cols() {
    return Array.from({ length: this.#cols }, (_, col) => Array.from({ length: this.#rows }, (_, row) => this.#data[(this.#cols * row) + col]));
  }
  [inspect.custom]() {
    const maxLength = Math.floor(Math.log10(this.#rows));
    return `rows: ${this.#rows}, cols: ${this.#cols}\n${
      this.rows.map((row, r) =>
        `${(this.system === 'rc' ? r : this.#rows - r - 1).toString().padStart(maxLength, '0')}: ${
          row.map((cell) => typeof cell === 'object' && cell !== null && !(inspect.custom in cell) ? JSON.stringify(cell) : cell).join('')
        }`
      ).join('\n')
    }`;
  }
}
