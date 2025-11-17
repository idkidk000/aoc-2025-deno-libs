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
export type CoordSystem = 'rc' | 'xy';

export class Grid<Cell> {
  #rows: number;
  #cols: number;
  #array: Cell[];
  constructor(system: CoordSystem, options: GridOptions<Cell>, inspector?: CellInspector<Cell>);
  constructor(system: CoordSystem, data: Cell[][], inspector?: CellInspector<Cell>);
  constructor(system: CoordSystem, grid: Grid<Cell>, inspector?: CellInspector<Cell>);
  constructor(
    public readonly system: CoordSystem,
    param: Cell[][] | GridOptions<Cell> | Grid<Cell>,
    public readonly inspector?: CellInspector<Cell>,
  ) {
    if (Array.isArray(param)) {
      this.#rows = param.length;
      this.#cols = param.length ? param[0].length : 0;
      this.#array = param.flat(1);
    } else if (param instanceof Grid) {
      this.#rows = param.#rows;
      this.#cols = param.#cols;
      this.#array = param.#array;
    } else if ('rows' in param) {
      this.#rows = param.rows;
      this.#cols = param.cols;
      this.#array = Array.from({ length: param.rows * param.cols }, (_, i) => param.fill(this.indexToCoord(i)));
    } else {
      throw new Error('invalid constructor params');
    }
  }
  #unsafeIndexToCoord(i: number): GridCoord {
    const r = Math.floor(i / this.#cols);
    const c = i - r * this.#cols;
    const y = this.#rows - r - 1;
    return { x: c, y, r, c, i };
  }
  #unsafeRcToIndex(r: number, c: number): number {
    return r * this.#cols + c;
  }
  #unsafeXyToIndex(x: number, y: number): number {
    return (this.#rows - y - 1) * this.#cols + x;
  }
  public inBounds(x: number, y: number): boolean;
  public inBounds(r: number, c: number): boolean;
  public inBounds(i: number): boolean;
  public inBounds(p0: number, p1?: number): boolean {
    if (typeof p1 === 'undefined') return p0 >= 0 && p0 < this.#array.length;
    const [r, c] = this.system === 'rc' ? [p0, p1] : [p1, p0];
    return r >= 0 && r < this.#rows && c >= 0 && c < this.#cols;
  }
  /** Throws on oob */
  public indexToCoord(i: number): GridCoord {
    if (this.#array && (i < 0 || i > this.#array.length - 1))
      throw new Error(`out of bounds: {i: ${i}}, array.length: ${this.#array.length}`);
    return this.#unsafeIndexToCoord(i);
  }
  /** Throws on oob */
  public coordToIndex(x: number, y: number): number;
  public coordToIndex(r: number, c: number): number;
  public coordToIndex(p0: number, p1: number): number {
    if (!this.inBounds(p0, p1)) throw new Error('out of bounds');
    return this.system === 'rc' ? this.#unsafeRcToIndex(p0, p1) : this.#unsafeXyToIndex(p0, p1);
  }
  public find(predicate: (value: Cell, coord: GridCoord) => boolean): (GridCoord & { value: Cell }) | undefined {
    const index = this.#array.findIndex((value, i) => predicate(value, this.#unsafeIndexToCoord(i)));
    if (index > -1) return { ...this.#unsafeIndexToCoord(index), value: this.#array[index] };
  }
  public findLast(predicate: (value: Cell, coord: GridCoord) => boolean): (GridCoord & { value: Cell }) | undefined {
    const index = this.#array.findLastIndex((value, i) => predicate(value, this.#unsafeIndexToCoord(i)));
    if (index > -1) return { ...this.#unsafeIndexToCoord(index), value: this.#array[index] };
  }
  public get rows() {
    return this.#rows;
  }
  public get cols() {
    return this.#cols;
  }
  public get internal() {
    return this.#array;
  }
  public *rowItems(): Generator<Cell[], void, void> {
    for (let r = 0; r < this.#rows; ++r) yield this.#array.slice(r * this.#cols, (r + 1) * this.#cols);
  }
  public *rowEntries(): Generator<[{ r: number; y: number }, Cell[]], void, void> {
    for (let r = 0; r < this.#rows; ++r)
      yield [{ r, y: this.#rows - 1 - r }, this.#array.slice(r * this.#cols, (r + 1) * this.#cols)];
  }
  public rowAt(r: number): Cell[] | undefined;
  public rowAt(y: number): Cell[] | undefined;
  public rowAt(p0: number): Cell[] | undefined {
    if (p0 < 0 || p0 > this.#rows - 1) return;
    const r = this.system === 'rc' ? p0 : this.#rows - 1 - p0;
    return this.#array.slice(r * this.#cols, (r + 1) * this.#cols);
  }
  public *colItems(): Generator<Cell[], void, void> {
    const col = new Array<Cell>(this.#rows);
    for (let c = 0; c < this.#cols; ++c) {
      for (let r = 0; r < this.#rows; ++r) col[r] = this.#array[this.#cols * r + c];
      yield col;
    }
  }
  public *colEntries(): Generator<[{ c: number; x: number }, Cell[]], void, void> {
    const col = new Array<Cell>(this.#rows);
    for (let c = 0; c < this.#cols; ++c) {
      for (let r = 0; r < this.#rows; ++r) col[r] = this.#array[this.#cols * r + c];
      yield [{ c, x: c }, col];
    }
  }
  public colAt(c: number): Cell[] | undefined;
  public colAt(x: number): Cell[] | undefined;
  public colAt(p0: number): Cell[] | undefined {
    if (p0 < 0 || p0 > this.#cols - 1) return;
    const col = new Array<Cell>(this.#rows);
    for (let r = 0; r < this.#rows; ++r) col[r] = this.#array[this.#cols * r + p0];
    return col;
  }
  public *cellItems(): Generator<Cell, void, void> {
    for (const cell of this.#array) yield cell;
  }
  public *cellEntries(): Generator<[GridCoord, Cell], void, void> {
    for (const [i, cell] of this.#array.entries()) yield [this.#unsafeIndexToCoord(i), cell];
  }
  public cellAt(r: number, c: number): Cell | undefined;
  public cellAt(x: number, y: number): Cell | undefined;
  public cellAt(i: number): Cell | undefined;
  public cellAt(p0: number, p1?: number): Cell | undefined {
    if (typeof p1 === 'undefined') return this.#array.at(p0);
    if (!this.inBounds(p0, p1)) return;
    return this.#array[this.system === 'rc' ? this.#unsafeRcToIndex(p0, p1) : this.#unsafeXyToIndex(p0, p1)];
  }
  public cellSet(r: number, c: number, value: Cell): Cell;
  public cellSet(x: number, y: number, value: Cell): Cell;
  public cellSet(i: number, value: Cell): Cell;
  public cellSet(p0: number, p1: number | Cell, p2?: Cell): Cell {
    if (typeof p2 === 'undefined') {
      if (!this.inBounds(p0)) throw new Error('out of bounds');
      this.#array[p0] = p1 as Cell;
      return p1 as Cell;
    }
    if (!this.inBounds(p0, p1 as number)) throw new Error('out of bounds');
    this.#array[this.system === 'rc' ? this.#unsafeRcToIndex(p0, p1 as number) : this.#unsafeXyToIndex(p0, p1 as number)] = p2;
    return p2;
  }
  /** Mutates this `Grid` instance */
  public rotate(angle: 90 | 180 | 270): this {
    if (![90, 180, 270].includes(angle)) throw new Error('invalid rotation angle');
    const array = new Array<Cell>(this.#array.length);
    for (let r = 0; r < this.#rows; ++r) {
      for (let c = 0; c < this.#cols; ++c) {
        const value = this.#array[this.#unsafeRcToIndex(r, c)];
        if (angle === 90) array[c * this.#rows + (this.#rows - 1 - r)] = value;
        else if (angle === 180) array[(this.#rows - 1 - r) * this.#cols + (this.#cols - 1 - c)] = value;
        else if (angle === 270) array[(this.#cols - 1 - c) * this.#rows + r] = value;
      }
    }
    this.#array = array;
    if (angle !== 180) [this.#rows, this.#cols] = [this.#cols, this.#rows];
    return this;
  }
  /** Returns a new `Grid` instance */
  public toRotated(angle: 90 | 180 | 270): Grid<Cell> {
    const grid = new Grid(this.system, this, this.inspector);
    return grid.rotate(angle);
  }
  /** Mutates this `Grid` instance */
  public reverse(): this {
    this.#array.reverse();
    return this;
  }
  /** Returns a new `Grid` instance */
  public toReversed(): Grid<Cell> {
    const grid = new Grid(this.system, this, this.inspector);
    grid.#array.reverse();
    return grid;
  }
  public get length() {
    return this.#array.length;
  }
  public [inspect.custom]() {
    const maxLength = Math.floor(Math.log10(this.#rows));
    return `rows: ${this.#rows}, cols: ${this.#cols}\n${
      this.rowItems().map((row, r) =>
        `${(this.system === 'rc' ? r : this.#rows - r - 1).toString().padStart(maxLength, '0')}: ${
          row.map((cell, c) => this.inspector?.(cell, this.#unsafeIndexToCoord(r * this.#cols + c)) ?? cell).join('')
        }`
      ).toArray().join('\n')
    }`;
  }
}
