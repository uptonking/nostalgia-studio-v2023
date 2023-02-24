import { Editor, NodeEntry, Transforms } from 'slate';

export function removeTable(table: NodeEntry, editor: Editor) {
  if (editor && table) {
    Transforms.removeNodes(editor, {
      // @ts-expect-error fix-types
      match: (n) => n.type === 'table',
      at: table[1],
    });
  }
}
