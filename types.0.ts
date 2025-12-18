declare const __brand: unique symbol;
declare const __indexedBy: unique symbol;

export type Brand<Base, Label extends string, IndexedBy extends string | undefined = undefined> =
  & Base
  & { [__brand]: Label }
  // deno-lint-ignore ban-types
  & (IndexedBy extends string ? { [__indexedBy]: IndexedBy } : {});
