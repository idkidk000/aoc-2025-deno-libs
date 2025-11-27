import { EventEmitter } from 'node:events';
import { inspect } from 'node:util';

// write then increment for pushBack, decrement then read for popBack
// decrement then write for pushFront, read then increment for popFront
// i.e. this.#back = writeable ix, this.#front = readable ix

const ARRAYLIKE_PROPERTY_RE = /-?[0-9+]/u;

type ArrayLike<Item> = Record<number, Item> & { length: number };

export enum DequeDelete {
  None,
  Null,
  Full,
}

export interface DequeParams {
  growthFactor?: number | false;
  deleteStrategy?: DequeDelete;
}

/** Basic circular array
 *
 * (actually it's quite complete now)
 */
export class Deque<Item> {
  #array: Item[];
  #front = 0;
  #back = 0;
  #growthFactor: number | false;
  #deleteStrategy: DequeDelete;
  #startingLength: number;
  #size: number;
  // used by `DequeArrayLike2`
  protected emitter = new EventEmitter<{ grow: [from: number, to: number] }>();
  /** Lower growth factor is better for ram but higher is better for performance
   *
   * Full delete after pop allows gc but hurts performance. Leaving popped value untouched is fastest but prevents gc until it's overwritten. Setting popped value to null has minimal performance impact and allows gc
   */
  constructor(length?: number, params?: DequeParams);
  constructor(iterable: Iterable<Item>, params?: DequeParams);
  constructor(param: number | Iterable<Item> = 1024, { growthFactor = 2, deleteStrategy = DequeDelete.Null }: DequeParams = {}) {
    if (typeof growthFactor === 'number' && growthFactor <= 1) throw new Error('growthFactor must be false or >1');
    this.#growthFactor = growthFactor;
    this.#deleteStrategy = deleteStrategy;
    if (typeof param === 'number') {
      this.#array = new Array(Math.max(param, 1));
      this.#size = 0;
    } else {
      const items = [...param];
      this.#array = new Array(Math.ceil(Math.max(items.length * (this.#growthFactor ? this.#growthFactor : 1), 1)));
      // push back
      for (const item of items) this.#array[this.#back++] = item;
      this.#size = items.length;
    }
    this.#startingLength = this.#array.length;
  }
  #grow(): boolean {
    if (!this.#growthFactor) return false;
    // it's significantly faster to create a new array and copy everything over than to expand the existing array by writing beyond the last ix, then moving everything from front ix up to the new end
    // i suppose it must also be reallocating and copying internally
    const prevLength = this.#array.length;
    const array = new Array(Math.ceil(this.#array.length * this.#growthFactor));
    for (let destIx = 0; destIx < this.#array.length; ++destIx) {
      const intermediate = destIx + this.#back;
      array[destIx] = this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length];
    }
    this.#front = 0;
    this.#back = this.#array.length;
    this.#array = array;
    this.emitter.emit('grow', prevLength, this.#array.length);
    return true;
  }
  pushBack(...values: Item[]) {
    for (const value of values) {
      this.#array[this.#back] = value;
      if (this.#back === this.#array.length - 1) this.#back = 0;
      else ++this.#back;
      if (this.#size < this.#array.length - 1 || (this.#growthFactor && this.#grow())) ++this.#size;
      // array is full and growth is disabled
      else if (this.#front === this.#array.length - 1) this.#front = 0;
      else ++this.#front;
    }
    return this.#size;
  }
  pushFront(...values: Item[]) {
    for (const value of values) {
      if (this.#front === 0) this.#front = this.#array.length - 1;
      else --this.#front;
      this.#array[this.#front] = value;
      if (this.#size < this.#array.length - 1 || (this.#growthFactor && this.#grow())) ++this.#size;
      // array is full and growth is disabled
      else if (this.#back === 0) this.#back = this.#array.length - 1;
      else --this.#back;
    }
    return this.#size;
  }
  popBack(): Item | undefined {
    if (this.#size === 0) return;
    if (this.#back === 0) this.#back = this.#array.length - 1;
    else --this.#back;
    const value = this.#array[this.#back];
    if (this.#deleteStrategy === DequeDelete.Full) delete this.#array[this.#back];
    else if (this.#deleteStrategy === DequeDelete.Null) this.#array[this.#back] = null as Item;
    --this.#size;
    return value;
  }
  popFront(): Item | undefined {
    if (this.#size === 0) return;
    const value = this.#array[this.#front];
    if (this.#deleteStrategy === DequeDelete.Full) delete this.#array[this.#front];
    else if (this.#deleteStrategy === DequeDelete.Null) this.#array[this.#front] = null as Item;
    if (this.#front === this.#array.length - 1) this.#front = 0;
    else ++this.#front;
    --this.#size;
    return value;
  }
  at(index: number): Item | undefined {
    if (index >= 0) {
      if (index >= this.#size) return;
      const intermediate = index + this.#front;
      return this.#array.at(intermediate < this.#array.length ? intermediate : intermediate - this.#array.length);
    }
    if (-index > this.#size) return;
    const intermediate = this.#back + index;
    return this.#array.at(intermediate >= 0 ? intermediate : intermediate + this.#array.length);
  }
  set(index: number, value: Item): Item {
    if (index >= 0) {
      // regular `Array` grows when assigning to an oob index but that would break things
      if (index >= this.#size) throw new Error('out of bounds');
      const intermediate = index + this.#front;
      return this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length] = value;
    } else if (-index > this.#size) { throw new Error('out of bounds'); }
    const intermediate = this.#back + index;
    return this.#array[intermediate >= 0 ? intermediate : intermediate + this.#array.length] = value;
  }
  includes(value: Item, fromIndex?: number): boolean {
    for (let i = fromIndex ?? 0; i < this.#size; ++i) {
      const intermediate = i + this.#front;
      if (this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length] === value) return true;
    }
    return false;
  }
  some(callback: (value: Item, index: number, deque: this) => boolean): boolean {
    for (let i = 0; i < this.#size; ++i) {
      const intermediate = i + this.#front;
      if (callback(this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length], i, this)) return true;
    }
    return false;
  }
  every(callback: (value: Item, index: number, deque: this) => boolean): boolean {
    for (let i = 0; i < this.#size; ++i) {
      const intermediate = i + this.#front;
      if (!callback(this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length], i, this)) return false;
    }
    return true;
  }
  reduce(callback: (previousValue: Item, currentValue: Item, currentIndex: number, deque: this) => Item): Item;
  reduce<Reduced>(
    callback: (previousValue: Reduced, currentValue: Item, currentIndex: number, deque: this) => Reduced,
    initialValue: Reduced,
  ): Reduced;
  reduce<Reduced = Item>(
    callback: (previousValue: Reduced, currentValue: Item, currentIndex: number, deque: this) => Reduced,
    initialValue?: Reduced,
  ): Reduced {
    if (this.#size === 0) {
      if (typeof initialValue === 'undefined') throw new Error('Reduce of empty array with no initial value');
      return initialValue;
    }
    let [reduced, startIx] = (typeof initialValue === 'undefined' ? [this.#array[this.#front], 1] : [initialValue, 0]) as [Reduced, number];
    for (let i = startIx; i < this.#size; ++i) {
      const intermediate = i + this.#front;
      reduced = callback(reduced, this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length], i, this);
    }
    return reduced;
  }
  clear(): void {
    this.#array = new Array(this.#startingLength);
    this.#front = 0;
    this.#back = 0;
    this.#size = 0;
  }
  clone(): Deque<Item> {
    return new Deque(this, { deleteStrategy: this.#deleteStrategy, growthFactor: this.#growthFactor });
  }
  *itemsFront(): Generator<Item, void, void> {
    for (let i = 0; i < this.#size; ++i) {
      const intermediate = i + this.#front;
      yield this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length];
    }
  }
  *itemsBack(): Generator<Item, void, void> {
    for (let i = this.#size - 1; i >= 0; --i) {
      const intermediate = i + this.#front;
      yield this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length];
    }
  }
  *entriesFront(): Generator<[number, Item], void, void> {
    for (let i = 0; i < this.#size; ++i) {
      const intermediate = i + this.#front;
      yield [i, this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length]];
    }
  }
  *entriesBack(): Generator<[number, Item], void, void> {
    for (let i = 0; i < this.#size; ++i) {
      const intermediate = this.#size - i - 1 + this.#front;
      yield [i, this.#array[intermediate < this.#array.length ? intermediate : intermediate - this.#array.length]];
    }
  }
  get size() {
    return this.#size;
  }
  protected get internalLength() {
    return this.#array.length;
  }
  [Symbol.iterator]() {
    return this.itemsFront();
  }
  [inspect.custom]() {
    return {
      internal: this.#array,
      front: this.#front,
      back: this.#back,
      length: this.#array.length,
      size: this.#size,
    };
  }
}

/** `Deque` but you can also get and set members by their index in square bracket notation like an `Array`
 *
 * e.g., `new Deque(['a', 'b' ,'c'])[1]` returns `b`
 *
 * **This requires proxying which adds overhead to every single method call and property access** */
export class DequeArrayLike<Item> extends Deque<Item> implements ArrayLike<Item> {
  // This is just for typing and is overriden by the Proxy returned by the constructor since the `property in target` check fails
  [index: number]: Item;
  constructor(...params: ConstructorParameters<typeof Deque<Item>>) {
    super(...params);
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
    return new Proxy(this, {
      get(target, property, _receiver) {
        if (property in target) {
          const getter = target[property as keyof typeof target];
          if (getter instanceof Function) {
            // this is faster and seems to work reliably
            return getter.bind(target);
            // return function (...args: unknown[]) {
            //   /** > It's important to remember that TypeScript doesn't change the runtime behavior of JavaScript, and that JavaScript is somewhat famous for having some peculiar runtime behaviors.
            //    *  >
            //    *  > JavaScript's handling of `this` is indeed unusual
            //    *  *~ [Orta, 2020](https://github.com/microsoft/TypeScript-Website/blame/5b2c0a7c557102f2b6aa1c736fbea94e9863d82e/packages/documentation/copy/en/handbook-v2/Classes.md#L979)* */
            //   // @ts-expect-error ugh
            //   return getter.apply(this === receiver ? target : this, args);
            // };
          }
          return getter;
        }
        if (typeof property === 'string' && ARRAYLIKE_PROPERTY_RE.exec(property))
          return target.at(parseInt(property, 10));
      },
      set(target, property, value, receiver) {
        if (property in target) {
          const setter = target[property as keyof typeof target];
          // @ts-expect-error also ugh
          setter.apply(this === receiver ? target : this)(value);
          return true;
        }
        if (typeof property === 'string' && ARRAYLIKE_PROPERTY_RE.exec(property)) {
          target.set(parseInt(property, 10), value);
          return true;
        }
        return false;
      },
    });
  }
  // ArrayLike also needs to implement `length`
  get length(): number {
    return this.size;
  }
}

/** `Deque` but you can also get and set members by their index in square bracket notation like an `Array`
 *
 * e.g., `new Deque(['a', 'b' ,'c'])[1]` returns `b`
 *
 * **This requires defining properties for every possible new array index each time the internal array grows which is very slow**
 *
 * This also seems to add some overhead to other method calls */
export class DequeArrayLike2<Item> extends Deque<Item> implements ArrayLike<Item> {
  // this is overriden by #createProperties
  [index: number]: Item;
  #createProperties(from: number, to: number) {
    for (let i = from; i < to; ++i) {
      Object.defineProperty(this, i, {
        get() {
          return this.at(i);
        },
        set(value: Item) {
          return this.set(i, value);
        },
      });
    }
  }
  constructor(...params: ConstructorParameters<typeof Deque<Item>>) {
    super(...params);
    this.#createProperties(0, this.internalLength);
    this.emitter.addListener('grow', this.#createProperties);
  }
  // ArrayLike also needs to implement `length`
  get length(): number {
    return this.size;
  }
}
