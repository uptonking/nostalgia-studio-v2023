import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';

import cx from 'clsx';
import { Editor, Path } from 'slate';

import { css } from '@linaria/core';

import { themed } from '../../../styles';
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

interface ContextMenuProps {
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
 *  createPortal to document.body
 */
export const ContextMenu = ({
  editor,
  selectCells,
  visible,
  position,
}: ContextMenuProps) => {
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
      className={tableContextMenuCss}
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
      <span className={contextMenuSeparatorCss} />
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
      <span className={contextMenuSeparatorCss} />
      <div
        className={cx({ [contextMenuItemDisabled]: selectCells.length <= 1 })}
        onMouseDown={(e) => {
          e.preventDefault();
          if (selectCells.length < 2) return;
          run(mergeCells);
        }}
      >
        Merge Cells
      </div>
      <div
        className={cx({ [contextMenuItemDisabled]: !isMergeCell() })}
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


const tableContextMenuCss = css`
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  box-sizing: border-box;
  width: 200px;
  padding: 10px 4px;
  line-height: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 9px 28px rgb(0 0 0 / 5%), 0 6px 16px rgb(0 0 0 / 8%),
    0 3px 6px rgb(0 0 0 / 12%);
  font-size: 14px;

  & > div {
    box-sizing: border-box;
    width: 100%;
    height: 32px;
    padding: 6px 8px;
    cursor: pointer;

    &:hover {
      background: rgb(0 0 0 / 3%);
      border-radius: 4px;
    }
  }
`;

const contextMenuSeparatorCss = css`
  width: 100%;
  margin: 1px 0;
  border-bottom: 1px solid rgb(0 0 0 / 10%);
`;

const contextMenuItemDisabled = css`
  color: rgb(0 0 0 / 25%);
  cursor: not-allowed;
`;
