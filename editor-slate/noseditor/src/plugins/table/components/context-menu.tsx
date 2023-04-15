import React, { FC, useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import { Editor, Path } from 'slate';

import {
  deleteCol,
  deleteRow,
  insertColLeft,
  insertColRight,
  insertRowAbove,
  insertRowBelow,
  mergeCells,
  splitCells,
} from '../commands';
import type { TableCellElement } from '../types';
import { getCellBySelectOrFocus, setTableNodeOrigin } from '../utils/common';

interface Props {
  editor: Editor;
  selectCells: Path[];
  visible: boolean;
  position: {
    left: number;
    top: number;
    pageY: number;
  };
}

const CURSOR_DISTANCE = 8;

/**
 * 通过createPortal渲染在 document.body
 */
export const ContextMenu: FC<Props> = ({
  editor,
  selectCells,
  visible,
  position,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [point, setPoint] = useState({
    left: -9999,
    top: -999,
  });

  useEffect(() => {
    if (visible && menuRef.current) {
      const { offsetHeight, offsetWidth } = menuRef.current;
      const { innerHeight, innerWidth } = window;
      const top =
        offsetHeight + position.top > innerHeight - CURSOR_DISTANCE
          ? position.pageY - offsetHeight
          : position.pageY + CURSOR_DISTANCE;
      const left =
        offsetWidth + position.left > innerWidth - CURSOR_DISTANCE
          ? position.left - offsetWidth
          : position.left - CURSOR_DISTANCE;
      // console.log(
      //   ';; offsetHeight-position.top-innerHeight ', offsetHeight + position.top > innerHeight - CURSOR_DISTANCE,
      //   offsetHeight,
      //   position.top,
      //   position.pageY,
      //   innerHeight,
      //   top,
      // );
      setPoint({ top, left });
    }
  }, [visible, position]);

  /** update slateTableNode with originTable */
  const updateTableNode = (cellPaths: Path[]) => {
    const cells = getCellBySelectOrFocus(editor, cellPaths);
    setTableNodeOrigin(editor, Path.parent(Path.parent(cells[0])));
  };

  const run = (func: (editor: Editor, selectCells: Path[]) => void) => {
    func(editor, selectCells);
    updateTableNode(selectCells);
  };

  const isMergeCell = () => {
    const newCell = getCellBySelectOrFocus(editor, selectCells);
    for (const cellPath of newCell) {
      const [cellNode] = Editor.node(editor, cellPath);
      if (cellNode) {
        const { rowSpan = 1, colSpan = 1 } = cellNode as TableCellElement;
        if (rowSpan > 1 || colSpan > 1) return true;
      }
    }
    return false;
  };

  return ReactDOM.createPortal(
    <div
      ref={menuRef}
      className='nos-table-context-menu'
      style={{
        display: visible ? 'flex' : 'none',
        left: `${point.left + 10}px`,
        top: `${point.top - 10}px`,
      }}
      onContextMenu={(e) => {
        e.preventDefault();
      }}
    >
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          run(insertRowAbove);
        }}
      >
        Insert Row Above
      </div>
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          run(insertRowBelow);
        }}
      >
        Insert Row Below
      </div>
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          run(insertColLeft);
        }}
      >
        Insert Column Left
      </div>
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          run(insertColRight);
        }}
      >
        Insert Column Right
      </div>
      <span className='nos-split-line' />
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          run(deleteRow);
        }}
      >
        Delete Row
      </div>
      <div
        onMouseDown={(e) => {
          e.preventDefault();
          run(deleteCol);
        }}
      >
        Delete Column
      </div>
      <span className='nos-split-line' />
      <div
        className={selectCells.length > 1 ? '' : 'nos-disabled'}
        onMouseDown={(e) => {
          e.preventDefault();
          if (selectCells.length < 2) return;
          run(mergeCells);
        }}
      >
        Merge Cells
      </div>
      <div
        className={isMergeCell() ? '' : 'nos-disabled'}
        onMouseDown={(e) => {
          e.preventDefault();
          if (!isMergeCell()) return;
          run(splitCells);
        }}
      >
        Unmerged Cells
      </div>
    </div>,
    document.body,
  );
};
