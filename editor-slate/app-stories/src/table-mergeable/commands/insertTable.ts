import { Editor, Range, Transforms } from 'slate';

import { createTable } from '../table/creator';

export function insertTable(editor: Editor) {
  if (!editor.selection) return;

  const node = Editor.above(editor, {
    // @ts-expect-error fix-types
    match: (n) => n.type === 'table',
  });

  const isCollapsed = Range.isCollapsed(editor.selection);

  if (!node && isCollapsed) {
    const table = createTable(3, 3);
    Transforms.insertNodes(editor, table);
  }
}
