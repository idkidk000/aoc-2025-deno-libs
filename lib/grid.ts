export class Grid<T> {
  #data: T[];
  #rows: number;
  #cols: number;
  constructor(data: T[][] | { rows: number; cols: number; fill: T }) {
    if (Array.isArray(data)) {
      this.#data = data.flat();
      this.#rows = data.length;
      this.#cols = data.length ? data[0].length : 0;
    } else {
      this.#data = Array.from({ length: data.rows * data.cols }, () => data.fill);
      this.#rows = data.rows;
      this.#cols = data.cols;
    }
  }
  public getValue(row: number, col: number) {
    return this.#data[(this.#cols * row) + col];
  }
  public setValue(row: number, col: number, value: T) {
    this.#data[(this.#cols * row) + col] = value;
  }
  public get rowCount() {
    return this.#rows;
  }
  public get colCount() {
    return this.#cols;
  }
  public get rows() {
    return Array.from({ length: this.#rows }, (_, row) => this.#data.slice(row * this.#cols, (row + 1) * this.#cols));
  }
  public get cols() {
    return Array.from({ length: this.#cols }, (_, col) => Array.from({ length: this.#rows }, (_, row) => this.#data[(this.#cols * row) + col]));
  }
  public get printable() {
    const maxLength = this.#rows.toString().length;
    return this.rows.map((row, i) => `${i.toString().padStart(maxLength, '0')}: ${row.join('')}`);
  }
}
