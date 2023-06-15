import { assert } from 'chai';

import {
  type FormatSpanWithText,
  type InputOperation,
  type MarkMap,
  type RootDoc,
} from '../src/types';
import { type DistributiveOmit } from '../src/types/utils';
import { generateDocs } from './utils';

const defaultText = 'The Peritext editor';
const textChars = defaultText.split('');

/** Define a naive structure that accumulates patches and computes a document state.
 *  - This isn't as optimized as the structure we use in the actual codebase,
 *  but it lets us straightforwardly test whether the incremental patches that we have
 *  generated have converged on the correct state.
 */
export type TextWithMetadata = Array<{
  character: string;
  marks: MarkMap;
}>;

export type PathlessInputOperation = DistributiveOmit<InputOperation, 'path'>;

export type TraceSpec = {
  initialText?: string;
  preOps?: PathlessInputOperation[];
  inputOps1?: PathlessInputOperation[];
  inputOps2?: PathlessInputOperation[];
  expectedResult: FormatSpanWithText[];
};

describe('crdt RichTextSeq data type', () => {
  it('can insert and delete text', () => {
    const { docs } = generateDocs('abcde');
    const [doc1] = docs;

    doc1.change([
      {
        path: ['text'],
        action: 'delete',
        index: 0,
        count: 3,
      },
    ]);

    const root = doc1.getRoot<RootDoc>();
    if (root.text) {
      assert.deepEqual(root.text.join(''), 'de');
    } else {
      assert.fail('Doc does not contain text');
    }
  });

  it('records local changes in the deps clock', () => {
    const { docs } = generateDocs('a');
    const [doc1, doc2] = docs;

    const { change: change2 } = doc2.change([
      { path: ['text'], action: 'insert', index: 1, values: ['b'] },
    ]);

    // We should be able to successfully apply change2 on doc1 now;
    // its only dependency is change1, which should be recorded in doc1's clock
    // of changes that it's observed.
    assert.doesNotThrow(() => {
      doc1.applyChange(change2);
    });

    assert.deepEqual(doc1.root.text, ['a', 'b']);
    assert.deepEqual(doc2.root.text, ['a', 'b']);
  });

  it('handles concurrent deletion and insertion', () => {
    // testConcurrentWrites({
    //     initialText: "abrxabra",
    //     // doc1: delete the 'x', then insert 'ca' to form 'abracabra'
    //     inputOps1: [
    //         { action: "delete", index: 3, count: 1 },
    //         { action: "insert", index: 4, values: ["c", "a"] },
    //     ],
    //     // doc2: insert 'da' to form 'abrxadabra'
    //     inputOps2: [{ action: "insert", index: 5, values: ["d", "a"] }],
    //     expectedResult: [{ marks: {}, text: "abracadabra" }],
    // })
  });
});
