import { assert } from 'chai';

import { RGAIdentifier } from './RGAIdentifier';

describe('RGAIdentifier', function () {
  it('compareTo should return negative if a precedes b with same sid, different sum', () => {
    const a = new RGAIdentifier(0, 0);
    const b = new RGAIdentifier(0, 1);

    assert.isTrue(a.compareTo(b) < 0);
  });
  it('compareTo should return negative if a precedes b with different sid, same sum', () => {
    const a = new RGAIdentifier(0, 0);
    const b = new RGAIdentifier(1, 0);
    assert.isTrue(a.compareTo(b) < 0);
  });
  it('compareTo should return negative if a precedes b with different sid, different sum', () => {
    const a = new RGAIdentifier(0, 0);
    const b = new RGAIdentifier(1, 1);
    assert.isTrue(a.compareTo(b) < 0);
  });

  it('compareTo should return positive if b precedes a with same sid, different sum', () => {
    const a = new RGAIdentifier(0, 0);
    const b = new RGAIdentifier(0, 1);

    assert.isTrue(b.compareTo(a) > 0);
  });
  it('compareTo should return positive if b precedes a with different sid, same sum', () => {
    const a = new RGAIdentifier(0, 0);
    const b = new RGAIdentifier(1, 0);
    assert.isTrue(b.compareTo(a) > 0);
  });
  it('compareTo should return positive if b precedes a with different sid, different sum', () => {
    const a = new RGAIdentifier(0, 0);
    const b = new RGAIdentifier(1, 1);
    assert.isTrue(b.compareTo(a) > 0);
  });
});
