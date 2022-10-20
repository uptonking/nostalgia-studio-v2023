import { TextOperation } from '../src/text-operation';
import { randomOperation, randomString, randomTest } from './utils';

describe('TextOperation', () => {
  it('op-actions-length', () => {
    const o = new TextOperation();
    expect(0).toBe(o.baseLength);
    expect(0).toBe(o.targetLength);
    o.retain(5);
    expect(5).toBe(o.baseLength);
    expect(5).toBe(o.targetLength);
    o.insert('abc');
    expect(5).toBe(o.baseLength);
    expect(8).toBe(o.targetLength);
    o.retain(2);
    expect(7).toBe(o.baseLength);
    expect(10).toBe(o.targetLength);
    o.delete(2);
    expect(9).toBe(o.baseLength);
    expect(10).toBe(o.targetLength);
  });

  it('op-actions-chaining', () => {
    const o = new TextOperation()
      .retain(5)
      .retain(0)
      .insert('lorem')
      .insert('')
      .delete('abc')
      .delete(3)
      .delete(0)
      .delete('');
    expect(3).toBe(o.ops.length);
  });

  it(
    'operation-apply-randomly',
    randomTest(() => {
      const str = randomString(50);
      const o = randomOperation(str);
      expect(str.length).toBe(o.baseLength);
      expect(o.apply(str).length).toBe(o.targetLength);
    }),
  );

  it(
    'operation-invert-randomly',
    randomTest(() => {
      const str = randomString(50);
      const o = randomOperation(str);
      const p = o.invert(str);
      expect(o.baseLength).toBe(p.targetLength);
      expect(o.targetLength).toBe(p.baseLength);
      expect(p.apply(o.apply(str))).toBe(str);
    }),
  );

  it('operation-empty', () => {
    const o = new TextOperation();
    o.retain(0);
    o.insert('');
    o.delete('');
    expect(0).toBe(o.ops.length);
  });

  it('operation-compose', () => {
    // apply(apply(S, A), B) = apply(S, compose(A, B))

    const str = '复仇者 Iron Man';
    const oA = new TextOperation()
      .delete('复仇者 ')
      .retain(8)
      .insert(' 钢铁侠');
    const oB = new TextOperation()
      .retain(4)
      .delete('Iron Man')
      .insert('Captain');

    const opTrs = TextOperation.transform(oA, oB);

    expect(oA.compose(opTrs[1]).apply(str)).toBe('Captain 钢铁侠');
    expect(oB.compose(opTrs[0]).apply(str)).toBe('Captain 钢铁侠');
    expect(opTrs[1].apply(oA.apply(str))).toBe('Captain 钢铁侠');
  });

  it('op-transform-by-cases', () => {
    // apply(apply(S, A), B') = apply(apply(S, B), A')

    const str = '复仇者 Iron Man';
    const oA = new TextOperation()
      .delete('复仇者 ')
      .retain(8)
      .insert(' 钢铁侠');
    const oB = new TextOperation()
      .retain(4)
      .delete('Iron Man')
      .insert('Captain');

    const opTrs = TextOperation.transform(oA, oB);

    expect(opTrs[1].apply(oA.apply(str))).toBe('Captain 钢铁侠');
    expect(oA.compose(opTrs[1]).apply(str)).toBe('Captain 钢铁侠');
    expect(oB.compose(opTrs[0]).apply(str)).toBe('Captain 钢铁侠');
  });

  it(
    'op-transform-randomly',
    randomTest(() => {
      // apply(apply(S, A), B') = apply(apply(S, B), A')

      const str = randomString(20);
      const oA = randomOperation(str);
      const oB = randomOperation(str);
      const primes = oA.transform(oB);
      const aPrime = primes[0];
      const bPrime = primes[1];
      const abPrime = oA.compose(bPrime);
      const baPrime = oB.compose(aPrime);
      const afterAbPrime = abPrime.apply(str);
      const afterBaPrime = baPrime.apply(str);
      expect(abPrime.equals(baPrime)).toBe(true);
      expect(afterAbPrime).toBe(afterBaPrime);
    })
  );
});
