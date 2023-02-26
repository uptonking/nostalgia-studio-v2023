import { Editor, Node, NodeEntry, Path, Transforms } from 'slate';

import { createRow } from '../table/creator';
import { Col, splitTable } from '../table/selection';

export function insertBelow(table: NodeEntry, editor: Editor) {
  console.log('insertBelow-ing')
  const { selection } = editor;
  if (!selection || !table) return;

  const yIndex = table[1].length;

  const { gridTable, getCol } = splitTable(editor, table);
  console.log(';; gridTable ', gridTable)

  const [startCell] = Editor.nodes(editor, {
    // @ts-expect-error fix-types
    match: (n) => n.type === 'table-cell',
  });

  const [insertPositionCol] = getCol(
    // @ts-expect-error fix-types
    (c: Col) => c.cell.key === startCell[0].key && c.isReal,
  );

  let checkInsertEnable = true;
  const insertCols = new Map<string, Col>();

  const y =
    insertPositionCol.path[yIndex] + (insertPositionCol.cell.rowspan || 1) - 1;

  gridTable[y].forEach((col: Col) => {
    const [originCol] = getCol(
      (n: any) => n.isReal && n.cell.key === col.cell.key,
    );

    const { cell, path } = originCol;

    if (!gridTable[y + 1]) {
      insertCols.set(cell.key, originCol);
    } else if (path[yIndex] + (cell.rowspan || 1) - 1 === y) {
      insertCols.set(cell.key, originCol);
    } else {
      checkInsertEnable = false;
      return;
    }
  });

  if (!checkInsertEnable) {
    return;
  }

  const newRow = createRow(insertCols.size);

  [...insertCols.values()].forEach((value, index) => {
    newRow.children[index].colspan = value.cell.colspan || 1;
  });

  const [[, path]] = Editor.nodes(editor, {
    // @ts-expect-error fix-types
    match: (n) => n.type === 'table-row',
  });

  // @ts-expect-error fix-types
  for (let i = 1; i < startCell[0].rowspan; i++) {
    path[yIndex] += 1;
  }

  Transforms.insertNodes(editor, newRow as Node, {
    at: Path.next(path),
  });

  console.log(';; insertPath ', path, Path.next(path))

  // model修改完成后，将选区光标移到新行的第一个单元格
  // const focusPath = [...tablePath, insertRowIndex, 0];
  // Transforms.select(editor, {
  //   anchor: Editor.end(editor, focusPath),
  //   focus: Editor.end(editor, focusPath),
  // });
}
