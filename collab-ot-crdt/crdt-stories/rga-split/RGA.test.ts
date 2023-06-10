import { assert } from 'chai';

import { RGA } from './RGA';
import { RGAIdentifier } from './RGAIdentifier';
import { type RGAInsert } from './RGAInsert';
import { type RGANode } from './RGANode';
import { type RGARemove } from './RGARemove';

const LETTERS = 'abcdefghijklmnopqrstuvwxyzåäö';
function randomLetter(): string {
  return LETTERS.substr(Math.random() * LETTERS.length, 1);
}

describe('RGA', function () {
  it('should properly instantitate', () => {
    const rga = new RGA();
    assert.exists(rga);
  });

  it('should be empty when no insertions', () => {
    const rga = new RGA();
    assert.equal(rga.toString(), '');
  });

  it('head node should have null identifier', () => {
    const rga = new RGA();
    const node: RGANode = rga.findNodePos(0);

    assert.equal(node.id.compareTo(RGAIdentifier.NullIdentifier), 0);
  });

  it('should be able to create insertion operation', () => {
    const rga = new RGA();
    const reference: RGANode = rga.findNodePos(0);
    const insertion = rga.createInsert(reference.id, 'a');
    const insertionPos = rga.createInsertPos(0, 'a');

    assert.exists(insertion);
    assert.equal(insertion.content, 'a');
    // Insertion at 0 should refer to head node
    assert.equal(
      insertion.reference.compareTo(RGAIdentifier.NullIdentifier),
      0,
    );
    assert.exists(insertionPos);
    assert.equal(insertionPos.content, 'a');
    assert.equal(
      insertionPos.reference.compareTo(RGAIdentifier.NullIdentifier),
      0,
    );
  });

  it('should be able to apply insertion operation', () => {
    const rga = new RGA();
    const insertion = rga.createInsertPos(0, 'a');

    rga.insert(insertion);

    assert.equal(rga.toString(), 'a');
  });

  it('should be able to insert in many different places', () => {
    const rga = new RGA();

    const insertion1 = rga.createInsertPos(0, 'b');
    rga.insert(insertion1);
    const insertion2 = rga.createInsertPos(0, 'a');
    rga.insert(insertion2);
    const insertion3 = rga.createInsertPos(2, 'c');
    rga.insert(insertion3);

    assert.equal(rga.toString(), 'abc');
  });

  it('should be able to create remove operation', () => {
    const rga = new RGA();

    rga.insert(rga.createInsertPos(0, 'a'));
    rga.insert(rga.createInsertPos(1, 'b'));
    rga.insert(rga.createInsertPos(2, 'c'));

    const reference = rga.findNodePos(2);
    const removal = rga.createRemove(reference.id);
    const removalPos = rga.createRemovePos(1);

    assert.deepEqual(removal.reference, reference.id);
    assert.deepEqual(removalPos.reference, reference.id);
  });

  it('should be able to apply remove operation', () => {
    const rga = new RGA();

    rga.insert(rga.createInsertPos(0, 'a'));
    rga.insert(rga.createInsertPos(1, 'b'));
    rga.insert(rga.createInsertPos(2, 'c'));

    const removal = rga.createRemovePos(1);
    rga.remove(removal);

    assert.equal(rga.toString(), 'ac');
  });

  describe('stress test', () => {
    it('should converge between two clients inserting independently', () => {
      const rgaA = new RGA(1);
      const rgaB = new RGA(2);

      const op1a = rgaA.insert(rgaA.createInsertPos(0, 'a'));
      const op2a = rgaA.insert(rgaA.createInsertPos(1, 'b'));
      const op3a = rgaA.insert(rgaA.createInsertPos(2, 'c'));

      const op1b = rgaB.insert(rgaB.createInsertPos(0, '1'));
      const op2b = rgaB.insert(rgaB.createInsertPos(1, '2'));
      const op3b = rgaB.insert(rgaB.createInsertPos(2, '3'));

      rgaA.insert(op1b);
      rgaA.insert(op2b);
      rgaA.insert(op3b);
      rgaB.insert(op1a);
      rgaB.insert(op2a);
      rgaB.insert(op3a);

      assert.equal(rgaA.toString(), '123abc');
      assert.equal(rgaB.toString(), '123abc');
    });

    it('should converge between two clients removing same element', () => {
      const rgaA = new RGA(1);
      const rgaB = new RGA(2);

      const op1 = rgaA.insert(rgaA.createInsertPos(0, 'a'));
      const op2 = rgaA.insert(rgaA.createInsertPos(1, 'b'));
      const op3 = rgaA.insert(rgaA.createInsertPos(2, 'c'));

      rgaB.insert(op1);
      rgaB.insert(op2);
      rgaB.insert(op3);

      const op4a = rgaA.remove(rgaA.createRemovePos(1));
      const op4b = rgaB.remove(rgaB.createRemovePos(1));

      rgaA.remove(op4b);
      rgaB.remove(op4a);

      assert.equal(rgaA.toString(), 'ac');
      assert.equal(rgaB.toString(), 'ac');
    });

    it('should converge between two clients removing independently', () => {
      const rgaA = new RGA(1);
      const rgaB = new RGA(2);

      const op1 = rgaA.insert(rgaA.createInsertPos(0, 'a'));
      const op2 = rgaA.insert(rgaA.createInsertPos(1, 'b'));
      const op3 = rgaA.insert(rgaA.createInsertPos(2, 'c'));

      rgaB.insert(op1);
      rgaB.insert(op2);
      rgaB.insert(op3);

      const op4a = rgaA.remove(rgaA.createRemovePos(0));
      const op4b = rgaB.remove(rgaB.createRemovePos(2));

      rgaA.remove(op4b);
      rgaB.remove(op4a);

      assert.equal(rgaA.toString(), 'b');
      assert.equal(rgaB.toString(), 'b');
    });

    it('should converge when many clients do many changes interleaved', () => {
      const N_CLIENTS = 5;
      const N_ROUNDS = 5;
      const N_OPERATIONS = 10;

      /**
       * doRound - Performs a series of random operations on a RGA and returns them
       * @param rga The RGA of which to perform random opeartions on
       */
      function doRound(rga: RGA): {
        insertions: RGAInsert[];
        removals: RGARemove[];
      } {
        const insertions: RGAInsert[] = [];
        const removals: RGARemove[] = [];

        let currentLength = rga.toString().length;
        for (let operation = 0; operation < N_OPERATIONS; operation++) {
          if (Math.random() <= 0.5 && currentLength > 0) {
            // Do removal
            const op = rga.createRemovePos(
              Math.floor(Math.random() * currentLength),
            );
            rga.remove(op);

            removals.push(op);
            currentLength--;
          } else {
            // Do insertion
            const op = rga.createInsertPos(
              Math.round(Math.random() * currentLength),
              randomLetter(),
            );
            rga.insert(op);

            insertions.push(op);
            currentLength++;
          }
        }
        return { insertions, removals };
      }

      // Initialize the RGA
      const rgas: RGA[] = [];
      for (let client = 0; client < N_CLIENTS; client++) {
        rgas.push(new RGA(client));
      }

      for (let round = 0; round < N_ROUNDS; round++) {
        const roundOps = new Map<
          number,
          { insertions: RGAInsert[]; removals: RGARemove[] }
        >();

        // Perform all rounds of random operations
        for (let client = 0; client < N_CLIENTS; client++) {
          const ops = doRound(rgas[client]);
          roundOps.set(client, ops);
        }

        // Send operations to other clients
        for (let client = 0; client < N_CLIENTS; client++) {
          const ops = roundOps.get(client);
          if (ops === undefined) {
            throw new Error('Should never happen');
          }
          for (let otherClient = 0; otherClient < N_CLIENTS; otherClient++) {
            if (client === otherClient) {
              continue;
            }

            ops.insertions.forEach((op) => {
              rgas[otherClient].insert(op);
            });
            ops.removals.forEach((op) => {
              rgas[otherClient].remove(op);
            });
          }
        }
      }

      for (let client = 1; client < N_CLIENTS; client++) {
        assert.equal(rgas[client - 1].toString(), rgas[client].toString());
      }
    });
  });

  describe('String to RGA', function () {
    it('should create an empty RGA with an empty string', () => {
      const s = '';
      const rga = RGA.fromString(s);

      assert.equal(rga.toString(), s);
    });

    it('should create a single character RGA', () => {
      const s = 'a';
      const rga = RGA.fromString(s);

      assert.equal(rga.toString(), s);
    });

    it('should create a multiple character RGA', () => {
      const s = 'abcde';
      const rga = RGA.fromString(s);

      assert.equal(rga.toString(), s);
    });

    it('should create a multiple line RGA', () => {
      const s = 'abcde\nabcde\nabcde';
      const rga = RGA.fromString(s);

      assert.equal(rga.toString(), s);
    });
  });

  describe('to/fromRGAJSON', function () {
    it('should parse an empty RGA', () => {
      const oldRGA = new RGA();
      const rgaJSON = oldRGA.toRGAJSON();
      const newRGA = RGA.fromRGAJSON(rgaJSON);

      assert.equal(rgaJSON.nodes.length, 0);
      assert.equal(oldRGA.toString(), newRGA.toString());
    });

    it('should parse a single node RGA', () => {
      const oldRGA = new RGA();
      const insert = oldRGA.createInsertPos(0, 'a');
      oldRGA.insert(insert);
      const rgaJSON = oldRGA.toRGAJSON();
      const newRGA = RGA.fromRGAJSON(rgaJSON);

      assert.equal(rgaJSON.nodes.length, 1);
      assert.equal(oldRGA.toString(), newRGA.toString());
    });

    it('should store nodes in nodemap', () => {
      const oldRGA = new RGA();
      const insert = oldRGA.createInsertPos(0, 'a');
      oldRGA.insert(insert);
      const rgaJSON = oldRGA.toRGAJSON();
      const newRGA = RGA.fromRGAJSON(rgaJSON);

      assert.equal(oldRGA['nodeMap'].size, newRGA['nodeMap'].size);
    });

    it('should parse multiple node RGA', () => {
      const oldRGA = new RGA();
      const letters = ['a', 'b', 'c', 'd', 'e'];
      for (let i = 0; i < 5; i++) {
        const insert = oldRGA.createInsertPos(i, letters[i]);
        oldRGA.insert(insert);
      }
      const rgaJSON = oldRGA.toRGAJSON();
      const newRGA = RGA.fromRGAJSON(rgaJSON);

      assert.equal(rgaJSON.nodes.length, 5);
      assert.equal(oldRGA.toString(), newRGA.toString());
    });

    it('should parse deleted nodes in RGA', () => {
      const oldRGA = new RGA();
      const letters = ['a', 'b', 'c', 'd', 'e'];
      for (let i = 0; i < 5; i++) {
        const insert = oldRGA.createInsertPos(i, letters[i]);
        oldRGA.insert(insert);
      }
      const remove = oldRGA.createRemovePos(1);
      oldRGA.remove(remove);

      const rgaJSON = oldRGA.toRGAJSON();
      const newRGA = RGA.fromRGAJSON(rgaJSON);

      assert.equal(rgaJSON.nodes.length, 5);
      assert.equal(oldRGA.toString(), newRGA.toString());
    });

    it('should parse all deleted nodes in RGA', () => {
      const oldRGA = new RGA();
      const letters = ['a', 'b', 'c', 'd', 'e'];
      for (let i = 0; i < 5; i++) {
        const insert = oldRGA.createInsertPos(i, letters[i]);
        oldRGA.insert(insert);
      }
      for (let i = 0; i < 5; i++) {
        const remove = oldRGA.createRemovePos(0);
        oldRGA.remove(remove);
      }

      const rgaJSON = oldRGA.toRGAJSON();
      const newRGA = RGA.fromRGAJSON(rgaJSON);

      assert.equal(rgaJSON.nodes.length, 5);
      assert.equal(oldRGA.toString(), newRGA.toString());
    });

    it('should update clock on parse', () => {
      const oldRGA = new RGA();
      const letters = ['a', 'b', 'c', 'd', 'e'];
      for (let i = 0; i < 5; i++) {
        const insert = oldRGA.createInsertPos(i, letters[i]);
        oldRGA.insert(insert);
      }
      const rgaJSON = oldRGA.toRGAJSON();
      const newRGA = RGA.fromRGAJSON(rgaJSON);

      assert.equal(newRGA['clock'], 5);
    });

    it('should keep ID info', () => {
      const oldRGA = new RGA();
      const letters = ['a', 'b', 'c', 'd', 'e'];
      for (let i = 0; i < 5; i++) {
        const insert = oldRGA.createInsertPos(i, letters[i]);
        oldRGA.insert(insert);
      }
      const rgaJSON = oldRGA.toRGAJSON();
      const newRGA = RGA.fromRGAJSON(rgaJSON);

      let newCursor = newRGA['head']['next'];
      let oldCursor = oldRGA['head']['next'];
      while (newCursor && oldCursor) {
        assert.equal(newCursor.id.sid, oldCursor.id.sid);
        assert.equal(newCursor.id.sum, oldCursor.id.sum);
        newCursor = newCursor.next;
        oldCursor = oldCursor.next;
      }
    });

    it('should convert id to RGAIdentifier', () => {
      const oldRGA = new RGA();
      const insert = oldRGA.createInsertPos(0, 'a');
      oldRGA.insert(insert);
      const rgaJSON = oldRGA.toRGAJSON();
      const newRGA = RGA.fromRGAJSON(rgaJSON);

      if (newRGA['head']['next'] && oldRGA['head']['next']) {
        assert.instanceOf(newRGA['head']['next'].id, RGAIdentifier);
        newRGA['head']['next'].id.compareTo(oldRGA['head']['next'].id);
      } else {
        assert(false);
      }
    });

    it('should not change the original structure', () => {
      const oldRGA = new RGA();
      const insert = oldRGA.createInsertPos(0, 'a');
      oldRGA.insert(insert);
      const insert2 = oldRGA.createInsertPos(1, 'b');
      oldRGA.insert(insert2);

      oldRGA.toRGAJSON();
      assert.equal(oldRGA.toString(), 'ab');
    });

    it('should correctly set up split links', () => {
      const oldRGA = new RGA();
      oldRGA.insert(oldRGA.createInsertPos(0, 'abc'));
      oldRGA.insert(oldRGA.createInsertPos(2, '@'));
      oldRGA.insert(oldRGA.createInsertPos(1, '!'));

      const newRGA = RGA.fromRGAJSON(oldRGA.toRGAJSON());

      const head = newRGA['head'];
      assert.exists(head);
      assert(head?.next?.content === 'a');
      assert(head?.next?.split?.content === 'b');
      assert(head?.next?.split?.offset === 1);
      assert(head?.next?.split?.split?.content === 'c');
      assert(head?.next?.split?.split?.offset === 2);
    });
  });

  describe('::findPos(id)', () => {
    it('should return -1 if null id', () => {
      const rga = new RGA();
      rga.insert(rga.createInsertPos(0, 'a'));
      rga.insert(rga.createInsertPos(1, 'b'));
      rga.insert(rga.createInsertPos(2, 'c'));

      const pos = rga.findPos(RGAIdentifier.NullIdentifier);

      assert.equal(pos, -1);
    });

    it('should return -1 if not found', () => {
      const rga = new RGA();
      rga.insert(rga.createInsertPos(0, 'a'));
      rga.insert(rga.createInsertPos(1, 'b'));
      rga.insert(rga.createInsertPos(2, 'c'));

      const insert = rga.createInsertPos(2, 'x');

      const pos = rga.findPos(insert.id);

      assert.equal(pos, -1);
    });

    it('should return correct position in simple case with no tombstones', () => {
      const rga = new RGA();
      let insert1: RGAInsert;
      let insert2: RGAInsert;
      let insert3: RGAInsert;
      rga.insert((insert1 = rga.createInsertPos(0, 'a')));
      rga.insert((insert2 = rga.createInsertPos(1, 'b')));
      rga.insert((insert3 = rga.createInsertPos(2, 'c')));

      const pos1 = rga.findPos(insert1.id);
      const pos2 = rga.findPos(insert2.id);
      const pos3 = rga.findPos(insert3.id);

      assert.equal(pos1, 0);
      assert.equal(pos2, 1);
      assert.equal(pos3, 2);
    });

    it('should return correct position in corner case with tombstones', () => {
      const rga = new RGA();
      let insert1: RGAInsert;
      let insert2: RGAInsert;
      let insert3: RGAInsert;
      rga.insert((insert1 = rga.createInsertPos(0, 'a')));
      rga.insert((insert2 = rga.createInsertPos(1, 'b')));
      rga.insert((insert3 = rga.createInsertPos(2, 'c')));
      rga.remove(rga.createRemove(insert2.id));

      const pos1 = rga.findPos(insert1.id);
      const pos2 = rga.findPos(insert2.id);
      const pos3 = rga.findPos(insert3.id);

      assert.equal(pos1, 0);
      assert.equal(pos2, -1);
      assert.equal(pos3, 1);
    });
  });

  describe('chunk insertions', () => {
    it('should support simple insert with chunk', () => {
      const rga = new RGA();
      rga.insert(rga.createInsertPos(0, 'abc'));

      assert.equal(rga.toString(), 'abc');
    });

    it('should support inserting new character in-between chunk', () => {
      const rga = new RGA();
      rga.insert(rga.createInsertPos(0, 'abc'));
      rga.insert(rga.createInsertPos(1, '!'));

      assert.equal(rga.toString(), 'a!bc');
    });

    it('should support inserting new character in-between chunk multiple times', () => {
      const rga = new RGA();
      rga.insert(rga.createInsertPos(0, 'abc'));
      rga.insert(rga.createInsertPos(1, '!'));
      rga.insert(rga.createInsertPos(3, '@'));

      assert.equal(rga.toString(), 'a!b@c');
    });

    it('should support inserting new character in-between chunk concurrently', () => {
      const rga1 = new RGA(1);
      const rga2 = new RGA(2);
      let op1: RGAInsert;
      rga1.insert((op1 = rga1.createInsertPos(0, 'abc')));
      rga2.insert(op1);

      assert.equal(rga1.toString(), 'abc');
      assert.equal(rga2.toString(), 'abc');

      const insert1 = rga1.createInsertPos(1, '!');
      const insert2 = rga2.createInsertPos(2, '@');

      rga2.insert(insert2);
      rga2.insert(insert1);
      rga1.insert(insert1);
      rga1.insert(insert2);

      assert.equal(rga1.toString(), 'a!b@c');
      assert.equal(rga2.toString(), 'a!b@c');
    });

    it('should support inserting new character in-between chunk concurrently, with differing ids', () => {
      const rga1 = new RGA(2);
      const rga2 = new RGA(1);
      let op1: RGAInsert;
      rga1.insert((op1 = rga1.createInsertPos(0, 'abc')));
      rga2.insert(op1);

      assert.equal(rga1.toString(), 'abc');
      assert.equal(rga2.toString(), 'abc');

      const insert1 = rga1.createInsertPos(1, '!');
      const insert2 = rga2.createInsertPos(2, '@');

      rga2.insert(insert2);
      rga2.insert(insert1);
      rga1.insert(insert1);
      rga1.insert(insert2);

      assert.equal(rga1.toString(), 'a!b@c');
      assert.equal(rga2.toString(), 'a!b@c');
    });

    it('should support inserting new character in-between chunk concurrently, in another order', () => {
      const rga1 = new RGA(1);
      const rga2 = new RGA(2);
      let op1: RGAInsert;
      rga1.insert((op1 = rga1.createInsertPos(0, 'abc')));
      rga2.insert(op1);

      assert.equal(rga1.toString(), 'abc');
      assert.equal(rga2.toString(), 'abc');

      const insert1 = rga1.createInsertPos(1, '!');
      const insert2 = rga2.createInsertPos(2, '@');

      rga2.insert(insert1);
      rga2.insert(insert2);
      rga1.insert(insert2);
      rga1.insert(insert1);

      assert.equal(rga1.toString(), 'a!b@c');
      assert.equal(rga2.toString(), 'a!b@c');
    });

    it('should remove character in start of chunk', () => {
      const rga = new RGA();
      rga.insert(rga.createInsertPos(0, 'abc'));
      rga.remove(rga.createRemovePos(0));

      assert.equal(rga.toString(), 'bc');
    });

    it('should remove character in middle of chunk', () => {
      const rga = new RGA();
      rga.insert(rga.createInsertPos(0, 'abc'));
      rga.remove(rga.createRemovePos(1));

      assert.equal(rga.toString(), 'ac');
    });

    it('should remove character in end of chunk', () => {
      const rga = new RGA();
      rga.insert(rga.createInsertPos(0, 'abc'));
      rga.remove(rga.createRemovePos(2));

      assert.equal(rga.toString(), 'ab');
    });

    it('should correctly remove after split', () => {
      const rga = new RGA();
      rga.insert(rga.createInsertPos(0, 'abc'));
      rga.insert(rga.createInsertPos(1, '!'));
      rga.insert(rga.createInsertPos(3, '!'));
      assert.equal(rga.toString(), 'a!b!c');

      rga.remove(rga.createRemovePos(4));
      assert.equal(rga.toString(), 'a!b!');
      rga.remove(rga.createRemovePos(2));
      assert.equal(rga.toString(), 'a!!');
      rga.remove(rga.createRemovePos(0));
      assert.equal(rga.toString(), '!!');
    });
  });
});
