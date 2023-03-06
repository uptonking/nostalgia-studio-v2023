import { expect } from 'chai';
import { applyPatch } from '../src/applyPatch';

describe('applyPatch', () => {
  describe('move', () => {
    let a: any;

    beforeEach(() => {
      a = {
        matrix: [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
        ],
        vector: [10, 20],
      };
    });

    it('move in arrays', () => {
      expect(
        applyPatch(a, [
          { op: 'move', from: '/matrix/2/0', path: '/matrix/1/-' },
        ]),
      ).to.deep.equal({
        matrix: [
          [0, 1, 2],
          [3, 4, 5, 6],
          [7, 8],
        ],
        vector: [10, 20],
      });
    });

    it('move correctly forward in one array', () => {
      expect(
        applyPatch(a, [
          { op: 'move', from: '/matrix/0/0', path: '/matrix/0/2' },
        ]),
      ).to.deep.equal({
        matrix: [
          [1, 2, 0],
          [3, 4, 5],
          [6, 7, 8],
        ],
        vector: [10, 20],
      });
    });

    it('move correctly backward in one array', () => {
      expect(
        applyPatch(a, [
          { op: 'move', from: '/matrix/0/2', path: '/matrix/0/0' },
        ]),
      ).to.deep.equal({
        matrix: [
          [2, 0, 1],
          [3, 4, 5],
          [6, 7, 8],
        ],
        vector: [10, 20],
      });
    });

    it('move correctly between arrays', () => {
      expect(
        applyPatch(a, [
          { op: 'move', from: '/matrix/0/0', path: '/matrix/1/3' },
        ]),
      ).to.deep.equal({
        matrix: [
          [1, 2],
          [3, 4, 5, 0],
          [6, 7, 8],
        ],
        vector: [10, 20],
      });
    });

    it('object', () => {
      expect(
        applyPatch(a, [{ op: 'move', from: '/vector', path: '/matrix/-' }]),
      ).to.deep.equal({
        matrix: [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
          [10, 20],
        ],
      });
    });

    it('no changes', () => {
      const prevA = a;
      expect(
        applyPatch(a, [{ op: 'move', from: '/matrix/-', path: '/matrix/-' }]),
      ).to.deep.equal({
        matrix: [
          [0, 1, 2],
          [3, 4, 5],
          [6, 7, 8],
        ],
        vector: [10, 20],
      });

      expect(a).to.equal(prevA);
    });
  });
});
