import { type Change, type Patch, RichTextSeq } from '../../src';

const defaultText = 'The Peritext editor';

/** Create and return two RichTextSeq documents with the same text content.
 * - Useful for creating a baseline upon which to play further changes
 */
export const generateDocs = (
  text: string = defaultText,
  count: number = 2,
): {
  docs: RichTextSeq[];
  patches: Patch[][];
  initialChange: Change;
} => {
  const docs = Array(count)
    .fill(1)
    .map((_, i) => {
      return new RichTextSeq(`doc${i + 1}`);
    });
  const patches: Patch[][] = Array(count)
    .fill(1)
    .map(() => []);
  const textChars = text.split('');

  // Generate a change on doc0
  const { change: initialChange, patches: initialPatches } = docs[0].change([
    { path: [], action: 'makeList', key: 'text' },
    {
      path: ['text'],
      action: 'insert',
      index: 0,
      values: textChars,
    },
  ]);
  patches[0] = initialPatches;

  for (const [index, doc] of docs.entries()) {
    if (index === 0) continue;
    patches[index] = doc.applyChange(initialChange);
  }

  return { docs, patches, initialChange };
};
