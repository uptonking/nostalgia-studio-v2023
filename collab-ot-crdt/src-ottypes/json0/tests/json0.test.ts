import { type } from '../src';

describe('json0-op', () => {
  it('json0-by-cases', () => {
    expect(
      type.apply({ a: [100, 200, 300], b: 'hi' }, [{ p: ['a', 0], ld: 100 }]),
    ).toEqual({ a: [200, 300], b: 'hi' });
  });
});
