import { Delta, Op } from '../../src';

describe('Op', () => {
  describe('length()', () => {
    it('delete', () => {
      expect(Op.length({ delete: 5 })).toEqual(5);
    });

    it('retain', () => {
      expect(Op.length({ retain: 2 })).toEqual(2);
    });

    it('insert text', () => {
      expect(Op.length({ insert: 'text' })).toEqual(4);
    });

    it('insert embed', () => {
      expect(Op.length({ insert: 2 })).toEqual(1);
    });
  });
});
