import { isObject, walkObject, WalkObjectCallbackArgs } from '../../src/shared/utils/walk-object';

const collect = (root: Parameters<typeof walkObject>[0]): WalkObjectCallbackArgs[] => {
  const calls: WalkObjectCallbackArgs[] = [];
  walkObject(root, (args) => calls.push({ ...args }));
  return calls;
};

describe('isObject', () => {
  it('returns true for plain objects', () => {
    expect(isObject({})).toBe(true);
    expect(isObject({ a: 1 })).toBe(true);
  });

  it('returns false for arrays', () => {
    expect(isObject([])).toBe(false);
    expect(isObject([1, 2])).toBe(false);
  });

  it('returns false for null', () => {
    expect(isObject(null)).toBe(false);
  });

  it('returns false for primitives', () => {
    expect(isObject('hello')).toBe(false);
    expect(isObject(42)).toBe(false);
    expect(isObject(true)).toBe(false);
    expect(isObject(undefined)).toBe(false);
  });
});

describe('walkObject', () => {
  it('emits a leaf callback for each scalar value with the correct location', () => {
    const calls = collect({ a: 1, b: 'two' });
    expect(calls).toEqual([
      { value: 1, key: 'a', location: ['a'], isLeaf: true },
      { value: 'two', key: 'b', location: ['b'], isLeaf: true }
    ]);
  });

  it('emits a non-leaf callback before recursing into a nested object', () => {
    const calls = collect({ outer: { inner: 'x' } });
    expect(calls).toEqual([
      { value: { inner: 'x' }, key: 'outer', location: ['outer'], isLeaf: false },
      { value: 'x', key: 'inner', location: ['outer', 'inner'], isLeaf: true }
    ]);
  });

  it('walks deeply nested objects with cumulative locations', () => {
    const calls = collect({ a: { b: { c: 1 } } });
    const leaves = calls.filter((c) => c.isLeaf);
    expect(leaves).toEqual([{ value: 1, key: 'c', location: ['a', 'b', 'c'], isLeaf: true }]);
  });

  it('treats undefined values as leaves (used by checkConfig to detect missing config)', () => {
    const calls = collect({ optional: undefined });
    expect(calls).toEqual([{ value: undefined, key: 'optional', location: ['optional'], isLeaf: true }]);
  });

  it('treats null values as leaves', () => {
    const calls = collect({ field: null });
    expect(calls).toEqual([{ value: null, key: 'field', location: ['field'], isLeaf: true }]);
  });

  it('walks objects inside arrays with index-suffixed key and indexed location', () => {
    const calls = collect({ items: [{ x: 1 }, { x: 2 }] });
    expect(calls).toEqual([
      { value: { x: 1 }, key: 'items:0', location: ['items', 0], isLeaf: false },
      { value: 1, key: 'x', location: ['items', 0, 'x'], isLeaf: true },
      { value: { x: 2 }, key: 'items:1', location: ['items', 1], isLeaf: false },
      { value: 2, key: 'x', location: ['items', 1, 'x'], isLeaf: true }
    ]);
  });

  it('does not crash on an empty object', () => {
    expect(() => walkObject({}, () => {})).not.toThrow();
    expect(collect({})).toEqual([]);
  });

  it('does not crash on an empty array value', () => {
    expect(collect({ items: [] })).toEqual([]);
  });

  it('emits a single leaf callback for a primitive inside an array', () => {
    const calls = collect({ tags: ['a', 'b'] });
    expect(calls).toEqual([
      { value: 'a', key: 'tags:0', location: ['tags', 0], isLeaf: true },
      { value: 'b', key: 'tags:1', location: ['tags', 1], isLeaf: true }
    ]);
  });
});
