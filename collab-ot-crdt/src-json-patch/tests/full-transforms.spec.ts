import { expect } from 'chai';
import { text } from '../src/custom/delta';
import { JSONPatch, type JSONPatchOp } from '../src';
import { Delta, type Op } from '@typewriter/delta';

class MyJSONPatch extends JSONPatch {
  constructor(ops?: JSONPatchOp[]) {
    super(ops, { '@changeText': text });
  }

  changeText(path: string, value: Delta | Op[]) {
    const delta = Array.isArray(value) ? new Delta(value) : (value as Delta);
    if (!delta || !Array.isArray(delta.ops)) {
      throw new Error('Invalid Delta');
    }
    return this.op('@changeText', path, value);
  }
}

describe('JSONPatch.transform', () => {
  // verbose(true)

  let delta = new Delta();
  const arr = [
    { zero: 0 },
    { one: 1 },
    { two: 2 },
    { three: 3 },
    { four: 4 },
    { five: 5 },
    { six: 6 },
    { seven: 7 },
  ];
  const obj = { x: [1, 2, 3, {}, 5, 6, 7, 8], y: 'foo' };
  let server: any;
  let client1: any;
  let client2: any;

  function patch() {
    return new MyJSONPatch();
  }

  function testPatches(
    start: any,
    patch1: JSONPatch,
    patch2: JSONPatch,
    reverse: boolean,
  ) {
    (client1 = start), (client2 = start), (server = start);
    // Patches applied on clients simultaneously
    client1 = patch1.apply(client1);
    client2 = patch2.apply(client2);
    // Both patches sent to the server, client 1 reaches there first
    server = patch1.apply(server);
    // Server sees that patch2 was at the same rev # as patch1 and transforms it, sending the transformed patch to
    // to the clients.
    const patch2T = patch1.transform(server, patch2);
    server = patch1.transform(server, patch2).apply(server);
    // client 1 gets patch2T from the server at rev+1 and applies it directly, never knowing it was transformed
    client1 = patch2T.apply(client1);
    // client 2 gets patch 1 from the server and must transform its pending patch to apply them in order
    client2 = start;
    client2 = patch1.apply(client2);
    client2 = patch2T.apply(client2);
    expect(client1).to.deep.equal(
      server,
      `base transformation did not work${reverse ? ' in reverse' : ''}`,
    );
    expect(client2).to.deep.equal(
      server,
      `transformation with priority did not work${
        reverse ? ' in reverse' : ''
      }`,
    );
  }

  function test(start: any, patch1: JSONPatch, patch2: JSONPatch) {
    testPatches(start, patch1, patch2, false);
    testPatches(start, patch2, patch1, true);
  }

  describe('operations', () => {
    describe('add vs', () => {
      it('add vs add - array', () => {
        test(arr, patch().add('/1', 'hi1'), patch().add('/1', 'x'));
        test(arr, patch().add('/1', 'hi1'), patch().add('/1/foo', 'x'));
      });

      it('add vs add - object', () => {
        test(obj, patch().add('/x', 'hi1'), patch().add('/x', 'x'));
      });

      it('add vs remove - array', () => {
        test(arr, patch().add('/1', 'hi1'), patch().remove('/1'));
      });

      it('add vs remove - object', () => {
        test(obj, patch().add('/x', 'hi1'), patch().remove('/x'));
      });

      it('add vs replace - array', () => {
        test(arr, patch().add('/1', 'hi1'), patch().replace('/1', 'x'));
      });

      it('add vs replace - object', () => {
        test(obj, patch().add('/x', 'hi1'), patch().replace('/x', 'x'));
      });

      it('add vs copy - array', () => {
        test(arr, patch().add('/1', 'hi1'), patch().copy('/0', '/1'));
        test(arr, patch().add('/1', 'hi1'), patch().copy('/1', '/0'));
      });

      it('add vs copy - object', () => {
        // test(obj, patch().add('/x', 'hi1'), patch().copy('/y', '/x'))
        test(obj, patch().add('/x', 'hi1'), patch().copy('/x', '/y'));
      });

      it('add vs move - array', () => {
        test(arr, patch().add('/1', 'hi1'), patch().move('/0', '/1'));
        test(arr, patch().add('/1', 'hi1'), patch().move('/1', '/0'));
        test(arr, patch().add('/3', 'hi1'), patch().move('/0', '/3'));
        test(arr, patch().add('/3', 'hi1'), patch().move('/3', '/0'));
      });

      it('add vs move - object', () => {
        test(obj, patch().add('/x', 'hi1'), patch().move('/y', '/x'));
        test(obj, patch().add('/x', 'hi1'), patch().move('/x', '/y'));
      });
    });
  });

  describe('array', () => {
    it('ensure non-arrays are handled as properties', () => {
      test(obj, patch().add('/1', 'hi1'), patch().add('/0', 'x'));
    });

    it('bumps paths when list elements are inserted or removed', () => {
      test(arr, patch().add('/1', 'hi1'), patch().add('/0', 'x'));
      test(arr, patch().add('/0', 'hi2'), patch().add('/0', 'x'));
      test(arr, patch().add('/0', 'hi3'), patch().add('/1', 'x'));
      test(arr, patch().changeText('/1', []), patch().add('/0', 'x'));
      test(arr, patch().changeText('/0', []), patch().add('/0', 'x'));
      test(arr, patch().changeText('/0', []), patch().add('/1', 'x'));
      test(arr, patch().add('/1', 'hi1'), patch().copy('/6', '/0'));
      test(arr, patch().add('/0', 'hi2'), patch().copy('/6', '/0'));
      test(arr, patch().add('/0', 'hi3'), patch().copy('/6', '/1'));

      test(arr, patch().add('/1', 'hi4'), patch().remove('/0'));
      test(arr, patch().add('/0', 'hi5'), patch().remove('/1'));
      test(arr, patch().add('/0', 'hi6'), patch().remove('/0'));
      test(arr, patch().add('/2', 'hi7'), patch().remove('/2'));
      test(obj, patch().add('/x/3/x', 'hi8'), patch().add('/x/5', 'x'));
      test(obj, patch().add('/x/3/x', 'hi9'), patch().add('/x/0', 'x'));
      test(obj, patch().add('/x/3/x', 'hi9'), patch().add('/x/3', 'x'));
      test(arr, patch().changeText('/1', []), patch().remove('/0'));
      test(arr, patch().changeText('/0', []), patch().remove('/1'));
      test(arr, patch().changeText('/0', []), patch().remove('/0'));

      test(arr, patch().remove('/0'), patch().add('/0', 'x'));
    });

    it('converts ops on deleted elements to noops', () => {
      test(arr, patch().remove('/1'), patch().remove('/1'));
      test(arr, patch().changeText('/1', delta), patch().remove('/1'));
      test(arr, patch().add('/1', 'foo'), patch().remove('/1'));
    });

    it('converts replace to add on deleted elements', () => {
      // Fixed behavior with replace which is the same as remove+add, so if there is a remove then it converts to an add
      test(arr, patch().replace('/1', 'hi1'), patch().remove('/1'));
    });

    it('converts ops on deleted elements to noops', () => {
      test(arr, patch().remove('/1'), patch().remove('/1'));
      test(arr, patch().replace('/1', 'foo'), patch().remove('/1'));
      test(arr, patch().changeText('/1', delta), patch().remove('/1'));
      test(arr, patch().add('/1', true), patch().remove('/1'));
    });

    it('puts the transformed op second if two inserts are simultaneous', () => {
      test(arr, patch().add('/1', 'a'), patch().add('/1', 'b'));
    });

    it('converts an attempt to re-delete a list element into a no-op', () => {
      test(arr, patch().remove('/1'), patch().remove('/1'));
    });

    it('moves ops on a moved element with the element', () => {
      test(arr, patch().remove('/4'), patch().move('/4', '/6'));
      test(arr, patch().replace('/4', 'a'), patch().move('/4', '/6'));
      test(arr, patch().changeText('/4', []), patch().move('/4', '/6'));
      test(arr, patch().add('/4/1', 'a'), patch().move('/4', '/6'));
      test(arr, patch().replace('/4/1', 'a'), patch().move('/4', '/6'));

      test(arr, patch().add('/0', null), patch().move('/0', '/1'));
      test(arr, patch().add('/5', 'x'), patch().move('/5', '/1'));
      test(arr, patch().remove('/5'), patch().move('/5', '/1'));
      test(arr, patch().add('/0', {}), patch().move('/0', '/0'));
      test(arr, patch().add('/0', []), patch().move('/1', '/0'));
      test(arr, patch().add('/2', 'x'), patch().move('/0', '/1'));
      test(arr, patch().add('/5', 'x'), patch().move('/6', '/1'));
      test(arr, patch().add('/1', 'x'), patch().move('/1', '/6'));
      test(arr, patch().add('/2', 'x'), patch().move('/1', '/6'));
      test(arr, patch().move('/3', '/5'), patch().move('/0', '/6'));
    });

    it('moves target index on remove/add', () => {
      test(arr, patch().move('/0', '/2'), patch().remove('/1'));
      test(arr, patch().move('/2', '/4'), patch().remove('/1'));
      test(arr, patch().move('/0', '/2'), patch().add('/1', 'x'));
      test(arr, patch().move('/2', '/4'), patch().add('/1', 'x'));
      test(arr, patch().move('/0', '/0'), patch().add('/0', 28));
    });

    it('tiebreaks move vs. add/delete', () => {
      test(arr, patch().move('/0', '/2'), patch().remove('/0'));
      test(arr, patch().move('/0', '/2'), patch().add('/0', 'x'));
    });

    it('replacement vs. deletion', () => {
      test(arr, patch().replace('/0', 'y'), patch().remove('/0'));
      test(arr, patch().add('/0', 'y'), patch().remove('/0'));
    });

    it('replacement vs. insertion', () => {
      test(arr, patch().replace('/0', 'y'), patch().add('/0', 'x'));
      test(arr, patch().add('/5', 'y'), patch().replace('/0', 'x'));
    });

    it('replacement vs. replacement', () => {
      test(arr, patch().replace('/0', 'y'), patch().replace('/0', 'x'));
    });

    it('move vs. move', () => {
      test(arr, patch().move('/0', '/2'), patch().move('/2', '/1'));
      test(arr, patch().move('/3', '/3'), patch().move('/5', '/0'));
      test(arr, patch().move('/2', '/0'), patch().move('/1', '/0'));
      test(arr, patch().move('/2', '/0'), patch().move('/5', '/0'));
      test(arr, patch().move('/2', '/5'), patch().move('/2', '/0'));
      test(arr, patch().move('/0', '/1'), patch().move('/1', '/0'));
      test(arr, patch().move('/3', '/1'), patch().move('/1', '/3'));
      test(arr, patch().move('/1', '/3'), patch().move('/3', '/1'));
      test(arr, patch().move('/2', '/6'), patch().move('/0', '/1'));
      test(arr, patch().move('/2', '/6'), patch().move('/1', '/0'));
      test(arr, patch().move('/0', '/1'), patch().move('/2', '/1'));
      test(arr, patch().move('/0', '/0'), patch().move('/1', '/0'));
      test(arr, patch().move('/0', '/1'), patch().move('/1', '/3'));
      test(arr, patch().move('/2', '/1'), patch().move('/3', '/2'));
      test(arr, patch().move('/3', '/2'), patch().move('/2', '/1'));
    });

    it('changes indices correctly around a move', () => {
      test(arr, patch().add('/0/0', {}), patch().move('/1', '/0'));
      test(arr, patch().move('/1', '/0'), patch().remove('/0'));
      test(arr, patch().move('/0', '/1'), patch().remove('/1'));
      test(arr, patch().move('/6', '/0'), patch().remove('/2'));
      test(arr, patch().move('/1', '/0'), patch().remove('/2'));
      test(arr, patch().move('/2', '/1'), patch().remove('/1'));

      test(arr, patch().remove('/2'), patch().move('/1', '/2'));
      test(arr, patch().remove('/1'), patch().move('/2', '/1'));

      test(arr, patch().remove('/1'), patch().move('/0', '/1'));

      test(arr, patch().replace('/1', 2), patch().move('/1', '/0'));
      test(arr, patch().replace('/1', 3), patch().move('/0', '/1'));
      test(arr, patch().replace('/0', 4), patch().move('/1', '/0'));
    });

    it('add vs. move', () => {
      test(arr, patch().add('/0', []), patch().move('/1', '/3'));
      test(arr, patch().add('/1', []), patch().move('/1', '/3'));
      test(arr, patch().add('/2', []), patch().move('/1', '/3'));
      test(arr, patch().add('/3', []), patch().move('/1', '/3'));
      test(arr, patch().add('/4', []), patch().move('/1', '/3'));

      test(arr, patch().move('/1', '/3'), patch().add('/0', []));
      test(arr, patch().move('/1', '/3'), patch().add('/1', []));
      test(arr, patch().move('/1', '/3'), patch().add('/2', []));
      test(arr, patch().move('/1', '/3'), patch().add('/3', []));
      test(arr, patch().move('/1', '/3'), patch().add('/4', []));

      test(arr, patch().add('/0', []), patch().move('/1', '/2'));
      test(arr, patch().add('/1', []), patch().move('/1', '/2'));
      test(arr, patch().add('/2', []), patch().move('/1', '/2'));
      test(arr, patch().add('/3', []), patch().move('/1', '/2'));

      test(arr, patch().add('/0', []), patch().move('/3', '/1'));
      test(arr, patch().add('/1', []), patch().move('/3', '/1'));
      test(arr, patch().add('/2', []), patch().move('/3', '/1'));
      test(arr, patch().add('/3', []), patch().move('/3', '/1'));
      test(arr, patch().add('/4', []), patch().move('/3', '/1'));

      test(arr, patch().move('/3', '/1'), patch().add('/0', []));
      test(arr, patch().move('/3', '/1'), patch().add('/1', []));
      test(arr, patch().move('/3', '/1'), patch().add('/2', []));
      test(arr, patch().move('/3', '/1'), patch().add('/3', []));
      test(arr, patch().move('/3', '/1'), patch().add('/4', []));

      test(arr, patch().add('/0', []), patch().move('/2', '/1'));
      test(arr, patch().add('/1', []), patch().move('/2', '/1'));
      test(arr, patch().add('/2', []), patch().move('/2', '/1'));
      test(arr, patch().add('/3', []), patch().move('/2', '/1'));
    });
  });
});
