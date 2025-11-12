//TODO: start
export class PriorityQueue<Item> {
  constructor(public sorter: (a: Item, b: Item) => number, iterable?: Iterable<Item>) {
  }
}
