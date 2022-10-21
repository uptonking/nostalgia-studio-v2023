import { type } from '../src';
describe('ottypes-text-op', () => {
  it('op-by-cases', () => {
    expect(type.apply('hi there', [3, { d: 5 }, 'ot'])).toBe('hi ot');
  });
});
