import { Editor, Path, type Point, Transforms } from 'slate';

import { CustomEditor, TableCellElement, TableElement } from '../customTypes';
import { Direction } from '../types';
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
  editor: CustomEditor;
  direction: Direction;
  cellPaths: Path[];
}) {
  const newCell: Path[] = getCellBySelectOrFocus(editor, cellPaths);
  console.log(';; getRow ', direction, JSON.stringify(newCell));

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

  console.log(
    ';; origin-target ',
    JSON.stringify(originTable), // 表格所有单元格位置 [[0,0],[0,1]]
    tablePath, // 表格路径 [1]
    tableNode, // 表格内容
    targetCell, // 焦点单元格位置
  );

  return { originTable, targetCell, rowNum, colNum, tablePath, tableNode };
}

export function handleKeyDownPress(
  editor: CustomEditor,
  cellPaths: Path[],
): Point | undefined {
  if (!editor.selection) {
    return undefined;
  }

  const { originTable, targetCell, rowNum, tablePath } =
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

  const isCursorOnLastLine = insertOriginRowIndex === rowNum;

  if (isCursorOnLastLine) {
    console.log(';; 尾行向下要特殊处理 ');
  } else {
    const nextRowCell = getRealPathByPath(originTable, [
      insertOriginRowIndex,
      targetCell[1],
    ]);

    const focusPath = [...tablePath, nextRowCell[0], targetCell[1]];
    return Editor.end(editor, focusPath);
  }

  return undefined;
}
export function handleKeyUpPress(
  editor: CustomEditor,
  cellPaths: Path[],
): Point | undefined {
  if (!editor.selection) {
    return undefined;
  }

  const { originTable, targetCell, tablePath } =
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

  const isCursorOnFirstLine = insertOriginRowIndex === -1;

  if (isCursorOnFirstLine) {
    console.log(';; 首行向上要特殊处理 ');
  } else {
    // const nextRowCell = getRealPathByPath(originTable, [
    //   insertOriginRowIndex,
    //   targetCell[1],
    // ]);

    const focusPath = [...tablePath, insertOriginRowIndex, targetCell[1]];
    return Editor.end(editor, focusPath);
  }

  return undefined;
}
