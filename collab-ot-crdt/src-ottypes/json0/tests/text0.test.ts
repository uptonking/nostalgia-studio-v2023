import { text } from '../src/text0';

describe('text0-op', () => {
  it('text0-by-cases', () => {
    expect(
      text.apply('hi there', [
        { d: 'there', p: 3 },
        { i: 'ot', p: 3 },
      ]),
    ).toBe('hi ot');
    expect(text.compose([{ i: 'y', p: 100 }], [{ i: 'x', p: 0 }])).toEqual([
      { i: 'y', p: 100 },
      { i: 'x', p: 0 },
    ]);
  });
});
