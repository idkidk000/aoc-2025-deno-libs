//DONE

import { inspect } from 'node:util';

export interface GridCoord {
  x: number;
  y: number;
  r: number;
  c: number;
  i: number;
}

export type GridOptions<Cell> = { rows: number; cols: number; fill: (coord: GridCoord) => Cell };
export type CellInspector<Cell> = (cell: Cell, coord: GridCoord) => string;

export class Grid<Cell, System extends 'xy' | 'rc'> {
  #rows: number;
  #cols: number;
  #array: Cell[];
  constructor(system: System, options: GridOptions<Cell>, inspector?: CellInspector<Cell>);
  constructor(system: System, data: Cell[][], inspector?: CellInspector<Cell>);
  constructor(
    public readonly system: System,
    data: Cell[][] | GridOptions<Cell>,
    public readonly inspector?: CellInspector<Cell>,
  ) {
    if (Array.isArray(data)) {
      this.#rows = data.length;
      this.#cols = data.length ? data[0].length : 0;
      this.#array = data.flat(1);
    } else if ('rows' in data) {
      this.#rows = data.rows;
      this.#cols = data.cols;
      this.#array = Array.from({ length: data.rows * data.cols }, (_, i) => data.fill(this.indexToCoord(i)));
    } else { throw new Error('invalid constructor params'); }
  }
  public inBounds(x: number, y: number): boolean;
  public inBounds(r: number, c: number): boolean;
  public inBounds(a: number, b: number): boolean {
    const [r, c] = this.system === 'rc' ? [a, b] : [b, a];
    return r >= 0 && r < this.#rows && c >= 0 && c < this.#cols;
  }
  /** Throws on oob */
  public indexToCoord(i: number): GridCoord {
    if (this.#array && (i < 0 || i > this.#array.length - 1)) throw new Error(`out of bounds: {i: ${i}}, array.length: ${this.#array.length}`);
    const c = i % this.#cols;
    const r = Math.floor(i / this.#cols);
    const x = c;
    const y = this.#rows - r - 1;
    return { x, y, r, c, i };
  }
  /** Throws on oob */
  public coordToIndex(x: number, y: number): number;
  public coordToIndex(r: number, c: number): number;
  public coordToIndex(a: number, b: number): number {
    if (this.system === 'rc') {
      const [r, c] = [a, b];
      if (!this.inBounds(r, c)) throw new Error(`out of bounds: {r: ${r}, c: ${c}}, rows: ${this.#rows}, cols: ${this.#cols}`);
      const i = (r * this.#cols) + c;
      return i;
    }
    const [x, y] = [a, b];
    if (!this.inBounds(x, y)) throw new Error(`out of bounds: {x: ${x}, y: ${y}}, cols: ${this.#cols}, rows: ${this.#rows}`);
    const i = ((this.#rows - y - 1) * this.#cols) + x;
    return i;
  }
  public get(this: Grid<Cell, 'xy'>, x: number, y: number): Cell;
  public get(this: Grid<Cell, 'rc'>, r: number, c: number): Cell;
  public get(a: number, b: number): Cell {
    return this.#array[this.coordToIndex(a, b)];
  }
  public set(this: Grid<Cell, 'xy'>, x: number, y: number, value: Cell): Cell;
  public set(this: Grid<Cell, 'rc'>, r: number, c: number, value: Cell): Cell;
  public set(a: number, b: number, value: Cell): Cell {
    return this.#array[this.coordToIndex(a, b)] = value;
  }
  public find(predicate: (value: Cell, coord: GridCoord) => boolean) {
    const index = this.#array.findIndex((value, i) => predicate(value, this.indexToCoord(i)));
    if (index > -1) return { ...this.indexToCoord(index), value: this.#array[index] };
  }
  public findLast(predicate: (value: Cell, coord: GridCoord) => boolean) {
    const index = this.#array.findLastIndex((value, i) => predicate(value, this.indexToCoord(i)));
    if (index > -1) return { ...this.indexToCoord(index), value: this.#array[index] };
  }
  public get rowCount() {
    return this.#rows;
  }
  public get colCount() {
    return this.#cols;
  }
  public get internal() {
    return this.#array;
  }
  public get rows() {
    return Array.from({ length: this.#rows }, (_, row) => this.#array.slice(row * this.#cols, (row + 1) * this.#cols));
  }
  public get cols() {
    return Array.from({ length: this.#cols }, (_, col) => Array.from({ length: this.#rows }, (_, row) => this.#array[(this.#cols * row) + col]));
  }
  [inspect.custom]() {
    const maxLength = Math.floor(Math.log10(this.#rows));
    return `rows: ${this.#rows}, cols: ${this.#cols}\n${
      this.rows.map((row, r) =>
        `${(this.system === 'rc' ? r : this.#rows - r - 1).toString().padStart(maxLength, '0')}: ${
          row.map((cell, i) => this.inspector?.(cell, this.indexToCoord(i)) ?? cell).join('')
        }`
      ).join('\n')
    }`;
  }
}
