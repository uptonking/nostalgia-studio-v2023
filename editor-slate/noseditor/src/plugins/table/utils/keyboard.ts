import { Editor, Path, type Point, Transforms } from 'slate';

import { isCursorOnFirstLine, isCursorOnLastLine } from '../queries';
import {
  type TableCellElement,
  type TableElement,
  type WithTableEditor as CustomEditor,
} from '../types';
import { type Direction } from '../types';
import {
  createEmptyCellNode,
  createRowNode,
  getCellBySelectOrFocus,
  getColNumber,
  getRangeByOrigin,
  getRealPathByPath,
  getRowNumber,
  getTableByCellPath,
} from './common';

export function getTargetTableCellInfoForUpOrDown({
  editor,
  direction,
  cellPaths,
}: {
  editor: Editor;
  direction: Direction;
  cellPaths: Path[];
}) {
  const newCell: Path[] = getCellBySelectOrFocus(editor, cellPaths);
  // console.log(';; getRow ', direction, JSON.stringify(newCell));

  if (!newCell[0]) return undefined;

  // 获取源表格数据
  const [originTable, tablePath, tableNode] = getTableByCellPath(
    editor,
    newCell[0],
  );
  const colNum = getColNumber(tableNode);
  const rowNum = getRowNumber(originTable);
  // ?
  const targetIndex = direction === 'above' ? 0 : newCell.length - 1;
  /**  */
  const targetCell = Path.relative(newCell[targetIndex], tablePath);

  // console.log(
  //   ';; origin-target ',
  //   JSON.stringify(originTable), // 表格所有单元格位置 [[0,0],[0,1]]
  //   tablePath, // 表格路径 [1]
  //   tableNode, // 表格内容
  //   targetCell, // 焦点单元格位置
  // );

  return {
    originTable,
    targetCell,
    rowNum,
    colNum,
    tablePath,
    tableNode,
    activeCell: newCell[0],
  };
}

export function handleKeyArrowDownPress(
  editor: Editor,
  cellPaths: Path[],
): Point | undefined {
  if (!editor.selection) {
    return undefined;
  }

  const { originTable, targetCell, rowNum, tablePath, activeCell } =
    getTargetTableCellInfoForUpOrDown({
      editor,
      direction: 'below',
      cellPaths,
    });

  const addConstant = 1;
  const targetOriginCell = originTable[targetCell[0]][targetCell[1]];
  const insertOriginRowIndex =
    ((Array.isArray(targetOriginCell[0]) && Array.isArray(targetOriginCell[1])
      ? targetOriginCell[1][0]
      : targetOriginCell[0]) as number) + addConstant; // 普通场景直接到这里

  const activeCellEnd = Editor.end(editor, activeCell);
  const isCursorOnLastLineOfCell = isCursorOnLastLine(
    editor,
    activeCellEnd,
    editor.selection.anchor,
  );
  // console.log(
  //   ';; isCursorOnLastLineOfCell ', cellPaths,
  //   isCursorOnLastLineOfCell,
  //   activeCell, activeCellEnd,
  //   editor.selection.anchor,
  // );

  if (isCursorOnLastLineOfCell) {
    if (insertOriginRowIndex === rowNum) {
      // todo
      // console.log(';; 尾行向下要特殊处理 ');
      return Editor.after(editor, tablePath, { unit: 'block' });
    } else {
      const nextRowCell = getRealPathByPath(originTable, [
        insertOriginRowIndex,
        targetCell[1],
      ]);

      const focusPath = [...tablePath, nextRowCell[0], targetCell[1]];
      return Editor.end(editor, focusPath);
    }
  }

  return undefined;
}

export function handleKeyArrowUpPress(
  editor: Editor,
  cellPaths: Path[],
): Point | undefined {
  if (!editor.selection) {
    return undefined;
  }

  const { originTable, targetCell, tablePath, activeCell } =
    getTargetTableCellInfoForUpOrDown({
      editor,
      direction: 'above',
      cellPaths,
    });

  const addConstant = -1;
  const targetOriginCell = originTable[targetCell[0]][targetCell[1]];
  const insertOriginRowIndex =
    ((Array.isArray(targetOriginCell[0]) && Array.isArray(targetOriginCell[1])
      ? targetOriginCell[0][0]
      : targetOriginCell[0]) as number) + addConstant; // 普通场景直接到这里

  const activeCellStart = Editor.start(editor, activeCell);
  const isCursorOnFirstLineOfCell = isCursorOnFirstLine(
    editor,
    activeCellStart,
    editor.selection.anchor,
  );
  // console.log(
  //   ';; isCursorOnFirstLineOfCell ',
  //   cellPaths,
  //   isCursorOnFirstLineOfCell,
  //   activeCell,
  //   activeCellStart,
  //   editor.selection.anchor,
  // );

  if (isCursorOnFirstLineOfCell) {
    if (insertOriginRowIndex === -1) {
      // console.log(';; 首行向上要特殊处理 ');
      return Editor.before(editor, tablePath, { unit: 'block' });
    } else {
      const focusPath = [...tablePath, insertOriginRowIndex, targetCell[1]];
      return Editor.end(editor, focusPath);
    }
  }

  return undefined;
}
