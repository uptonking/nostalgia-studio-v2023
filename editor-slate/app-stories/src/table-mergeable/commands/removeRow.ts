import { Editor, type NodeEntry, Transforms } from 'slate';

import { type Cell } from '../table/creator';
import { type Col, splitTable } from '../table/selection';
import { splitCell } from './splitCell';

export function removeRow(table: NodeEntry, editor: Editor) {
  const { selection } = editor;
  if (!selection || !table) return;

  const { gridTable, getCol } = splitTable(editor, table);

  const yIndex = table[1].length;

  const [start, end] = Editor.edges(editor, selection);
  const [startNode] = Editor.nodes(editor, {
    // @ts-expect-error fix-types
    match: (n) => n.type === 'table-cell',
    at: start,
  });

  const [endNode] = Editor.nodes(editor, {
    // @ts-expect-error fix-types
    match: (n) => n.type === 'table-cell',
    at: end,
  });

  // @ts-expect-error fix-types
  const [startCol] = getCol((col: Col) => col.cell.key === startNode[0].key);
  // @ts-expect-error fix-types
  const [endCol] = getCol((col: Col) => col.cell.key === endNode[0].key);

  const yTop = startCol.path[yIndex];
  const yBottom = endCol.path[yIndex];

  const topLeftCol = gridTable[yTop][0];
  const bottomRight = gridTable[yBottom][gridTable[yBottom].length - 1];

  Transforms.setSelection(editor, {
    anchor: Editor.point(editor, topLeftCol.originPath),
    focus: Editor.point(editor, bottomRight.originPath),
  });

  splitCell(table, editor);

  const { gridTable: splitedGridTable } = splitTable(editor, table);

  const removeCols = splitedGridTable
    .slice(yTop, yBottom + 1)
    .reduce((p: Col[], c: Col[]) => [...p, ...c], []) as Col[];

  removeCols.forEach((col: Col) => {
    Transforms.removeNodes(editor, {
      at: table[1],
      // @ts-expect-error fix-types
      match: (n) => n.key === col.cell.key,
    });
  });

  Transforms.removeNodes(editor, {
    at: table[1],
    match: (n) => {
      // @ts-expect-error fix-types
      if (n.type !== 'table-row') {
        return false;
      }

      if (
        // @ts-expect-error fix-types
        !n.children ||
        // @ts-expect-error fix-types
        n.children.findIndex((cell: Cell) => cell.type === 'table-cell') < 0
      ) {
        return true;
      }

      return false;
    },
  });

  if (!Editor.string(editor, table[1])) {
    Transforms.removeNodes(editor, {
      at: table[1],
    });
  }
}
