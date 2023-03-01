/**
 * todo: 插入后光标位置
 */
import { Editor, Path, Transforms } from 'slate';

import { TableCellElement, TableElement } from '../customTypes';
import {
  createEmptyCellNode,
  createRowNode,
  getCellBySelectOrFocus,
  getRangeByOrigin,
  getRealPathByPath,
  getTableByCellPath,
} from '../utils/common';

type Direction = 'above' | 'below';
/**
 * 获取原始数据列数
 * 注：表格第一行肯定是所有列数据都有的
 * @param tableNode
 * @returns
 */
function getColNumber(tableNode: TableElement) {
  const rowNode = tableNode.children[0];
  let colNum = 0;
  rowNode.children.forEach((cellNode) => {
    const { colSpan = 1 } = cellNode;
    colNum += colSpan;
  });
  return colNum;
}

/**
 * 获取原始数据 行数
 * @param tableNode
 * @returns
 */
function getRowNumber(originTable: (number | number[])[][][]) {
  const lastRowOriginCell = originTable[originTable.length - 1][0];
  const rowIndex = (
    Array.isArray(lastRowOriginCell[0]) && Array.isArray(lastRowOriginCell[1])
      ? lastRowOriginCell[1][0]
      : lastRowOriginCell[0]
  ) as number;
  return rowIndex + 1;
}

/**
 * 插入行
 * @param editor
 * @param cellPaths
 */
function insertRow(editor: Editor, cellPaths: Path[], direction: Direction) {
  const newCell: Path[] = getCellBySelectOrFocus(editor, cellPaths);
  console.log(';; insertRow ', direction, JSON.stringify(newCell));

  if (!newCell[0]) return;

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

  const addConstant = direction === 'above' ? -1 : 1;
  const targetOriginCell = originTable[targetCell[0]][targetCell[1]];
  const insertOriginRowIndex =
    ((Array.isArray(targetOriginCell[0]) && Array.isArray(targetOriginCell[1])
      ? direction === 'above'
        ? targetOriginCell[0][0]
        : targetOriginCell[1][0]
      : targetOriginCell[0]) as number) + addConstant; // 普通场景直接到这里
  console.log(';; targetOriginCell ', targetOriginCell, insertOriginRowIndex);

  const toUpdateCellPaths: Path[] = [];
  const toInsertCells: TableCellElement[] = [];

  let insertRowIndex: number;

  if (direction === 'above' && insertOriginRowIndex === -1) {
    // /在首行上方插入一行
    const insertRows = createRowNode(
      Array.from({ length: colNum }).map(() => createEmptyCellNode()),
    );
    Transforms.insertNodes(editor, insertRows, {
      at: [...tablePath, 0],
    });
    insertRowIndex = 0;
  } else if (direction === 'below' && insertOriginRowIndex === rowNum) {
    // /在尾行下方插入一行
    const insertRows = createRowNode(
      Array.from({ length: colNum }).map(() => createEmptyCellNode()),
    );
    Transforms.insertNodes(editor, insertRows, {
      at: [...tablePath, tableNode.children.length],
    });
    insertRowIndex = tableNode.children.length;
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

      console.log(';; curr-cell ', currCell, currOriginCell, edgeRowIndex)

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

    insertRowIndex = direction === 'above' ? targetCell[0] : nextRowCell[0];
    console.log(';; addRowCells ', insertPath, nextRowCell, insertRowIndex)
  }

  console.log(';; insertPath ', tablePath, insertRowIndex)

  // model修改完成后，将选区光标移到新行的第一个单元格
  const focusPath = [...tablePath, insertRowIndex, 0];
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
