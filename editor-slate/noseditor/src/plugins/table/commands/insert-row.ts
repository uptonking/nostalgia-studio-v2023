/**
 * todo: 插入后光标位置
 */
import { Editor, Path, Transforms } from 'slate';

import type { Direction, TableCellElement, TableElement } from '../types';
import {
  createEmptyCellNode,
  createRowNode,
  getCellBySelectOrFocus,
  getColNumber,
  getRangeByOrigin,
  getRealPathByPath,
  getRowNumber,
  getTableByCellPath,
} from '../utils/common';
import { getTargetTableCellInfoForUpOrDown } from '../utils/keyboard';

/**
 * insert row above/below cellPaths
 */
function insertRow(editor: Editor, cellPaths: Path[], direction: Direction) {
  const { originTable, targetCell, rowNum, colNum, tablePath, tableNode } =
    getTargetTableCellInfoForUpOrDown({ editor, direction, cellPaths });

  const addConstant = direction === 'above' ? -1 : 1;
  const targetOriginCell = originTable[targetCell[0]][targetCell[1]];
  const insertOriginRowIndex =
    ((Array.isArray(targetOriginCell[0]) && Array.isArray(targetOriginCell[1])
      ? direction === 'above'
        ? targetOriginCell[0][0]
        : targetOriginCell[1][0]
      : targetOriginCell[0]) as number) + addConstant; // 普通场景直接到这里
  // console.log(';; targetOriginCell ', targetOriginCell, insertOriginRowIndex);

  const toUpdateCellPaths: Path[] = [];
  const toInsertCells: TableCellElement[] = [];

  let toInsertRowIndex: number;

  if (direction === 'above' && insertOriginRowIndex === -1) {
    // /在首行上方插入一行
    const insertRows = createRowNode(
      Array.from({ length: colNum }).map(() => createEmptyCellNode()),
    );
    Transforms.insertNodes(editor, insertRows, {
      at: [...tablePath, 0],
    });
    toInsertRowIndex = 0;
  } else if (direction === 'below' && insertOriginRowIndex === rowNum) {
    // /在尾行下方插入一行
    const insertRows = createRowNode(
      Array.from({ length: colNum }).map(() => createEmptyCellNode()),
    );
    Transforms.insertNodes(editor, insertRows, {
      at: [...tablePath, tableNode.children.length],
    });
    toInsertRowIndex = tableNode.children.length;
  } else {
    // /非首行上方、非尾行下方插入行，创建新行各列的内容
    Array.from({ length: colNum }).forEach((_, currColIndex) => {
      const currCell = getRealPathByPath(originTable, [
        insertOriginRowIndex,
        currColIndex,
      ]);
      const currOriginCell = getRangeByOrigin(originTable, [
        insertOriginRowIndex,
        currColIndex,
      ]) as number[][];
      const edgeRowIndex =
        direction === 'above' ? currOriginCell[1][0] : currOriginCell[0][0];

      // console.log(';; curr-cell ', currCell, currOriginCell, edgeRowIndex);

      if (
        !Array.isArray(currOriginCell[0]) ||
        edgeRowIndex === insertOriginRowIndex
      ) {
        // 当前单元格非合并单元格 或者 当前单元格为合并单元格底部(上方插入)/顶部(下方插入)
        toInsertCells.push(createEmptyCellNode());
      } else if (
        !toUpdateCellPaths.some((cellPath) => Path.equals(currCell, cellPath))
      ) {
        // 需要修改的合并单元格
        const [cellNode] = Editor.node(editor, [...tablePath, ...currCell]);
        const { rowSpan = 1 } = cellNode as TableCellElement;
        Transforms.setNodes(
          editor,
          {
            rowSpan: rowSpan + 1,
          },
          {
            at: [...tablePath, ...currCell],
          },
        );
        toUpdateCellPaths.push(currCell);
      }
      // /处理完所有列
    });

    const nextRowCell = getRealPathByPath(originTable, [
      insertOriginRowIndex,
      targetCell[1],
    ]);
    const insertPath = [
      ...tablePath,
      direction === 'above' ? targetCell[0] : nextRowCell[0],
    ];

    // 👇🏻 更新model
    Transforms.insertNodes(editor, createRowNode(toInsertCells), {
      at: insertPath,
    });

    toInsertRowIndex = direction === 'above' ? targetCell[0] : nextRowCell[0];
    // console.log(';; addRowCells ', insertPath, nextRowCell, toInsertRowIndex);
  }

  // console.log(';; insertPath ', tablePath, toInsertRowIndex);

  // model修改完成后，将选区光标移到新行的第一个单元格
  const focusPath = [...tablePath, toInsertRowIndex, 0];
  Transforms.select(editor, {
    anchor: Editor.end(editor, focusPath),
    focus: Editor.end(editor, focusPath),
  });
}

const insertRowAbove = (editor: Editor, cellPaths: Path[]) => {
  insertRow(editor, cellPaths, 'above');
};
const insertRowBelow = (editor: Editor, cellPaths: Path[]) => {
  insertRow(editor, cellPaths, 'below');
};

export { insertRowAbove, insertRowBelow };
