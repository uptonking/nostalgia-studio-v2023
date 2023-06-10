import { Editor, type NodeEntry, Transforms } from 'slate';

import { createRow } from '../table/creator';
import { type Col, splitTable } from '../table/selection';

export function insertAbove(table: NodeEntry, editor: Editor) {
  console.log('insertAbove-ing');

  const { selection } = editor;
  if (!selection || !table) return;

  const yIndex = table[1].length;

  const { gridTable, getCol } = splitTable(editor, table);

  const [startCell] = Editor.nodes(editor, {
    // @ts-expect-error fix-types
    match: (n) => n.type === 'table-cell',
  });

  const [insertPositionCol] = getCol(
    // @ts-expect-error fix-types
    (c: Col) => c.cell.key === startCell[0].key && c.isReal,
  );

  let checkInsertEnable = true;
  const insertYIndex = insertPositionCol.path[yIndex];
  const insertCols = new Map<string, Col>();

  gridTable[insertYIndex].forEach((col: Col) => {
    if (!col.isReal) {
      const [originCol] = getCol(
        (c: Col) => c.isReal && c.cell.key === col.cell.key,
      );

      if (originCol.path[yIndex] === insertYIndex) {
        insertCols.set(originCol.cell.key, originCol);
      } else {
        checkInsertEnable = false;
        return;
      }
    } else {
      insertCols.set(col.cell.key, col);
    }
  });

  if (!checkInsertEnable) {
    return;
  }

  const newRow = createRow(insertCols.size);

  [...insertCols.values()].forEach((col, index) => {
    newRow.children[index].colspan = col.cell.colspan || 1;
  });

  const [[, path]] = Editor.nodes(editor, {
    // @ts-expect-error fix-types
    match: (n) => n.type === 'table-row',
  });

  // @ts-expect-error fix-types
  Transforms.insertNodes(editor, newRow, {
    at: path,
  });
}
