import { AttributeMap } from '../src';

describe('AttributeMap', () => {
  describe('compose()', () => {
    const attributes = { bold: true, color: 'red' };

    it('left is undefined', () => {
      expect(AttributeMap.compose(undefined, attributes)).toEqual(attributes);
    });

    it('right is undefined', () => {
      expect(AttributeMap.compose(attributes, undefined)).toEqual(attributes);
    });

    it('both are undefined', () => {
      expect(AttributeMap.compose(undefined, undefined)).toBe(undefined);
    });

    it('missing', () => {
      expect(AttributeMap.compose(attributes, { italic: true })).toEqual({
        bold: true,
        italic: true,
        color: 'red',
      });
    });

    it('overwrite', () => {
      expect(
        AttributeMap.compose(attributes, { bold: false, color: 'blue' }),
      ).toEqual({
        bold: false,
        color: 'blue',
      });
    });

    it('remove', () => {
      expect(AttributeMap.compose(attributes, { bold: null })).toEqual({
        color: 'red',
      });
    });

    it('remove to none', () => {
      expect(
        AttributeMap.compose(attributes, { bold: null, color: null }),
      ).toEqual(undefined);
    });

    it('remove missing', () => {
      expect(AttributeMap.compose(attributes, { italic: null })).toEqual(
        attributes,
      );
    });

    describe('complex attribute', function () {
      it('add a new property', function () {
        expect(
          AttributeMap.compose(
            { complex: { foo: 123 } },
            { complex: { bar: 456 } },
          ),
        ).toEqual({
          complex: {
            foo: 123,
            bar: 456,
          },
        });
      });

      it('overwrite an existing property', function () {
        expect(
          AttributeMap.compose(
            { complex: { foo: 123 } },
            { complex: { foo: 456 } },
          ),
        ).toEqual({
          complex: { foo: 456 },
        });
      });

      it('remove an existing property', function () {
        expect(
          AttributeMap.compose(
            { complex: { foo: 123, bar: 456 } },
            { complex: { foo: null } },
          ),
        ).toEqual({
          complex: { bar: 456 },
        });
      });

      it('remove the last property', function () {
        expect(
          AttributeMap.compose(
            { complex: { foo: 123 } },
            { complex: { foo: null } },
          ),
        ).toBeUndefined();
      });

      it('overwrites arrays', function () {
        expect(
          AttributeMap.compose(
            { complex: { foo: [1, 2, 3] } },
            { complex: { foo: [1, 3] } },
          ),
        ).toEqual({ complex: { foo: [1, 3] } });
      });

      it('ignores null leaves on new attributes', function () {
        expect(
          AttributeMap.compose(undefined, {
            complex: { foo: null, bar: null },
          }),
        ).toBeUndefined();
      });

      it('deep mix of operations', function () {
        expect(
          AttributeMap.compose(
            {
              complex: {
                foo: {
                  bar: 123,
                  baz: 'abc',
                },
              },
            },
            {
              complex: {
                foo: {
                  bar: 456,
                },
                qux: 'def',
              },
            },
          ),
        ).toEqual({
          complex: {
            foo: {
              bar: 456,
              baz: 'abc',
            },
            qux: 'def',
          },
        });
      });
    });
  });

  describe('diff()', () => {
    const format = { bold: true, color: 'red' };

    it('left is undefined', () => {
      expect(AttributeMap.diff(undefined, format)).toEqual(format);
    });

    it('right is undefined', () => {
      const expected = { bold: null, color: null };
      expect(AttributeMap.diff(format, undefined)).toEqual(expected);
    });

    it('same format', () => {
      expect(AttributeMap.diff(format, format)).toEqual(undefined);
    });

    it('add format', () => {
      const added = { bold: true, italic: true, color: 'red' };
      const expected = { italic: true };
      expect(AttributeMap.diff(format, added)).toEqual(expected);
    });

    it('remove format', () => {
      const removed = { bold: true };
      const expected = { color: null };
      expect(AttributeMap.diff(format, removed)).toEqual(expected);
    });

    it('overwrite format', () => {
      const overwritten = { bold: true, color: 'blue' };
      const expected = { color: 'blue' };
      expect(AttributeMap.diff(format, overwritten)).toEqual(expected);
    });

    describe('complex attribute', function () {
      it('same format', function () {
        expect(
          AttributeMap.diff(
            { complex: { foo: 123 } },
            { complex: { foo: 123 } },
          ),
        ).toBeUndefined();
      });

      it('change the only property', function () {
        expect(
          AttributeMap.diff(
            { complex: { foo: 123 } },
            { complex: { foo: 456 } },
          ),
        ).toEqual({
          complex: { foo: 456 },
        });
      });

      it('change one property but not another', function () {
        expect(
          AttributeMap.diff(
            { complex: { foo: 123, bar: 456 } },
            { complex: { foo: 789, bar: 456 } },
          ),
        ).toEqual({
          complex: { foo: 789 },
        });
      });

      it('add a property', function () {
        expect(
          AttributeMap.diff(
            { complex: { foo: 123 } },
            { complex: { foo: 123, bar: 456 } },
          ),
        ).toEqual({
          complex: { bar: 456 },
        });
      });

      it('remove a property', function () {
        expect(
          AttributeMap.diff(
            { complex: { foo: 123, bar: 456 } },
            { complex: { foo: 123 } },
          ),
        ).toEqual({
          complex: { bar: null },
        });
      });

      it('array', function () {
        expect(
          AttributeMap.diff(
            { complex: { foo: [1, 2, 3] } },
            { complex: { foo: [1, 3] } },
          ),
        ).toEqual({
          complex: { foo: [1, 3] },
        });
      });
    });
  });

  describe('invert()', () => {
    it('attributes is undefined', () => {
      const base = { bold: true };
      expect(AttributeMap.invert(undefined, base)).toEqual({});
    });

    it('base is undefined', () => {
      const attributes = { bold: true };
      const expected = { bold: null };
      expect(AttributeMap.invert(attributes, undefined)).toEqual(expected);
    });

    it('both undefined', () => {
      expect(AttributeMap.invert()).toEqual({});
    });

    it('merge', () => {
      const attributes = { bold: true };
      const base = { italic: true };
      const expected = { bold: null };
      expect(AttributeMap.invert(attributes, base)).toEqual(expected);
    });

    it('null', () => {
      const attributes = { bold: null };
      const base = { bold: true };
      const expected = { bold: true };
      expect(AttributeMap.invert(attributes, base)).toEqual(expected);
    });

    it('replace', () => {
      const attributes = { color: 'red' };
      const base = { color: 'blue' };
      const expected = base;
      expect(AttributeMap.invert(attributes, base)).toEqual(expected);
    });

    it('noop', () => {
      const attributes = { color: 'red' };
      const base = { color: 'red' };
      const expected = {};
      expect(AttributeMap.invert(attributes, base)).toEqual(expected);
    });

    it('combined', () => {
      const attributes = {
        bold: true,
        italic: null,
        color: 'red',
        size: '12px',
      };
      const base = { font: 'serif', italic: true, color: 'blue', size: '12px' };
      const expected = { bold: null, italic: true, color: 'blue' };
      expect(AttributeMap.invert(attributes, base)).toEqual(expected);
    });

    describe('complex attribute', function () {
      it('add property', function () {
        const attributes = { complex: { bar: 456 } };
        const base = { complex: { foo: 123 } };
        const expected = { complex: { bar: null } };
        expect(AttributeMap.invert(attributes, base)).toEqual(expected);
      });

      it('remove property', function () {
        const attributes = { complex: { bar: null } };
        const base = { complex: { foo: 123, bar: 456 } };
        const expected = { complex: { bar: 456 } };
        expect(AttributeMap.invert(attributes, base)).toEqual(expected);
      });

      it('update existing property', function () {
        const attributes = { complex: { foo: 789 } };
        const base = { complex: { foo: 123, bar: 456 } };
        const expected = { complex: { foo: 123 } };
        expect(AttributeMap.invert(attributes, base)).toEqual(expected);
      });

      it('array', function () {
        const attributes = { complex: { foo: [1, 3] } };
        const base = { complex: { foo: [1, 2, 3] } };
        const expected = { complex: { foo: [1, 2, 3] } };
        expect(AttributeMap.invert(attributes, base)).toEqual(expected);
      });

      it('deep change', function () {
        const attributes = { complex: { foo: { bar: null } } };
        const base = { complex: { foo: { bar: 123, baz: 456 } } };
        const expected = { complex: { foo: { bar: 123 } } };
        expect(AttributeMap.invert(attributes, base)).toEqual(expected);
      });
    });
  });

  describe('transform()', () => {
    const left = { bold: true, color: 'red', font: null };
    const right = { color: 'blue', font: 'serif', italic: true };

    it('left is undefined', () => {
      expect(AttributeMap.transform(undefined, left, false)).toEqual(left);
    });

    it('right is undefined', () => {
      expect(AttributeMap.transform(left, undefined, false)).toEqual(undefined);
    });

    it('both are undefined', () => {
      expect(AttributeMap.transform(undefined, undefined, false)).toEqual(
        undefined,
      );
    });

    it('with priority', () => {
      expect(AttributeMap.transform(left, right, true)).toEqual({
        italic: true,
      });
    });

    it('without priority', () => {
      expect(AttributeMap.transform(left, right, false)).toEqual(right);
    });

    describe('complex attribute', function () {
      it('with priority', function () {
        expect(
          AttributeMap.transform(
            { complex: { foo: 123, bar: 456 } },
            { complex: { foo: 789, baz: 'abc' } },
            true,
          ),
        ).toEqual({ complex: { baz: 'abc' } });
      });

      it('without priority', function () {
        expect(
          AttributeMap.transform(
            { complex: { foo: 123, bar: 456 } },
            { complex: { foo: 789, baz: 'abc' } },
            false,
          ),
        ).toEqual({ complex: { foo: 789, baz: 'abc' } });
      });

      it('array', function () {
        expect(
          AttributeMap.transform(
            { complex: { foo: [1, 2, 3] } },
            { complex: { foo: [4, 5, 6] } },
          ),
        ).toEqual({ complex: { foo: [4, 5, 6] } });
      });
    });
  });
});
