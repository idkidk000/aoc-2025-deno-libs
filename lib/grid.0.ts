import { inspect } from 'node:util';

export class Grid<Cell> {
  #data: Cell[];
  #rows: number;
  #cols: number;
  constructor(data: Cell[][] | { rows: number; cols: number; fill: (x: number, y: number) => Cell }) {
    if (Array.isArray(data)) {
      this.#data = data.flat(1);
      this.#rows = data.length;
      this.#cols = data.length ? data[0].length : 0;
    } else {
      this.#data = Array.from({ length: data.rows * data.cols }, (_, i) => data.fill(i % data.cols, Math.floor(i / data.cols)));
      this.#rows = data.rows;
      this.#cols = data.cols;
    }
  }
  public indexToXy(i: number) {
    if (i < 0 || i >= this.#data.length) throw new Error(`{i: ${i}} out of range. length=${this.#data.length}`);
    return { x: i % this.#cols, y: Math.floor(i / this.#cols) };
  }
  public xyToIndex(x: number, y: number) {
    if (x > this.#cols - 1 || x < 0 || y > this.#rows - 1 || y < 0)
      throw new Error(`{x: ${x}, y: ${y}} out of range. cols=${this.#cols}, rows=${this.#rows}`);
    return (this.#cols * y) + x;
  }
  public getValue(x: number, y: number) {
    return this.#data[this.xyToIndex(x, y)];
  }
  public setValue(x: number, y: number, value: Cell) {
    this.#data[this.xyToIndex(x, y)] = value;
  }
  public find(predicate: (value: Cell, x: number, y: number) => boolean) {
    const index = this.#data.findIndex((value, i) => {
      const { x, y } = this.indexToXy(i);
      return predicate(value, x, y);
    });
    if (index > -1) return { ...this.indexToXy(index), value: this.#data[index] };
  }
  public get rowCount() {
    return this.#rows;
  }
  public get colCount() {
    return this.#cols;
  }
  public get data() {
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
      this.rows.map((row, i) =>
        `${i.toString().padStart(maxLength, '0')}: ${
          row.map((cell) => typeof cell === 'object' && cell !== null && !(inspect.custom in cell) ? JSON.stringify(cell) : cell).join('')
        }`
      ).join('\n')
    }`;
  }
}
