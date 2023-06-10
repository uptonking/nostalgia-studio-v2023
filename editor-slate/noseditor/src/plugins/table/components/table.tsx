import React, {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import cx from 'clsx';
import { isHotkey } from 'is-hotkey';
import { type Location, Path, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useSlate } from 'slate-react';

import { css } from '@linaria/core';

import { themed } from '../../../styles/theme-vars';
import { type ElementProps } from '../../types';
import { isSelectionInTable } from '../queries';
import {
  type TableCellElement,
  type TableElement,
  type TableRowElement,
  type WithTableEditor,
} from '../types';
import {
  getTableCellNode,
  isEditableInTable,
  setTableNodeOrigin,
} from '../utils/common';
import {
  handleKeyArrowDownPress,
  handleKeyArrowUpPress,
} from '../utils/keyboard';
import { getRealPathFromTableSelection } from '../utils/selection';
import { selectionBound } from '../utils/selection-bound';
import { ContextMenu } from './context-menu';

const ABSOLUTE_HIDDEN_MENU_POS = { left: -9999, top: -9999, pageY: -9999 };

/**
 * table with context menu
 * - 自绘表格选区
 *
 * todo
 * - 统一editor.selection和单元格选区selectCells
 */
export function CustomTable(props: ElementProps) {
  const { attributes, children } = props;
  const element = props.element as TableElement;

  const editor = useSlate() as ReactEditor & WithTableEditor;

  const tblRef = useRef<HTMLTableElement>(null);
  // todo edge-cases: cleanup when sel change
  const [tblSelStart, setTblSelStart] = useState<Path | null>(null);
  const [selectCells, setSelectCells] = useState<Path[]>([]);
  const [selBound, setSelBound] = useState({
    x: 0,
    y: 0,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });
  const [showTblSel, setShowTblSel] = useState(false);
  const [showCtxMenu, setShowCtxMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState(ABSOLUTE_HIDDEN_MENU_POS);

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent<HTMLTableElement>) => {
      const editorDom = ReactEditor.toDOMNode(editor, editor);
      // console.log(';; tbKeyDown');

      if (
        !isEditableInTable(editor) &&
        !isHotkey(['delete', 'backspace'], e) &&
        editorDom.getAttribute('contenteditable') === 'true'
      ) {
        // /if key is not delete backspace
        editorDom.setAttribute('contenteditable', 'false');
        Promise.resolve()
          .then(() => editorDom.setAttribute('contenteditable', 'true'))
          .catch(() => {});
      }

      const isSelInTable = isSelectionInTable(editor);
      if (isSelInTable) {
        // /only when cursor is in table
        let locationToSelect: Location | undefined = undefined;
        if (isHotkey('down', e)) {
          locationToSelect = handleKeyArrowDownPress(editor, selectCells);
        }
        if (isHotkey('up', e)) {
          locationToSelect = handleKeyArrowUpPress(editor, selectCells);
        }
        if (locationToSelect) {
          Transforms.select(editor, locationToSelect);
          e.stopPropagation();
          e.preventDefault();
        }
      }
    };
    editor.on('keydown', handleKeydown);
    return () => {
      editor.off('keydown', handleKeydown);
    };
    // }, [editor, selectCells]);
  });

  useEffect(() => {
    const mousedownCallback = (e: MouseEvent) => {
      const isTable = e.target && tblRef.current?.contains(e.target as Node);
      if (!isTable || e.button !== 2) {
        // /不在表格位置 || 不是鼠标右键
        // collapse 选区, and hide cotext menu
        Transforms.collapse(editor);
        setShowTblSel(false);
        setSelectCells([]);
        setShowCtxMenu(false);
        // setMenuPosition(ABSOLUTE_HIDDEN_MENU_POS);
      }
    };
    const mouseupCallback = () => {
      setTblSelStart(null);
    };

    const blurCallback = () => {
      setShowCtxMenu(false);
      // setMenuPosition(ABSOLUTE_HIDDEN_MENU_POS);
    };
    const reset = () => {
      setShowTblSel(false);
      setSelectCells([]);
    };

    if (editor) {
      editor.on('mousedown', mousedownCallback);
      window.addEventListener('mouseup', mouseupCallback);
      editor.on('blur', blurCallback);
      editor.on('resetTableSelection', reset);
    }
    return () => {
      editor.off('mousedown', mousedownCallback);
      window.removeEventListener('mouseup', mouseupCallback);
      editor.off('blur', blurCallback);
      editor.off('resetTableSelection', reset);
    };
  }, [editor]);

  useEffect(() => {
    // 注意避免死循环
    if (!editor || !element || (element as TableElement).originTable) return;
    const tablePath = ReactEditor.findPath(editor, element);
    setTableNodeOrigin(editor, tablePath);
  }, [editor, element]);

  useEffect(() => {
    if (!editor || selectCells.length < 2) return;
    setSelBound(selectionBound(editor, selectCells));
  }, [editor, editor.children, selectCells]);

  useEffect(() => {
    if (selectCells.length < 2) return;
    setShowTblSel(true);
  }, [selectCells]);

  useEffect(() => {
    editor.tableState = {
      showSelection: showTblSel,
      selection: selectCells,
    };
  }, [editor, selectCells, showTblSel]);

  const updateSelection = useCallback(
    (endPath: Path) => {
      if (!tblSelStart) return;
      if (Path.equals(tblSelStart, endPath)) {
        // 当选区为一个
        setShowTblSel(false);
        return;
      }
      setSelectCells(
        getRealPathFromTableSelection(
          editor,
          tblSelStart,
          endPath,
          element as TableElement,
        ),
      );
    },
    [editor, element, tblSelStart],
  );

  return (
    <div className={cx('nos-elem', rootTableCss)} {...attributes}>
      <table
        ref={tblRef}
        className={cx({ [tableActiveSelectionCss]: showTblSel })}
        onDragStart={(e) => e.preventDefault()}
        onMouseDown={(e) => {
          // console.log(';; mouse-down table ', e.target);
          const node = getTableCellNode(editor, e.target as HTMLElement);
          if (!node || e.button !== 0) return;
          setTblSelStart(node[1]);
        }}
        onMouseLeave={() => {
          if (tblSelStart) setShowTblSel(false);
        }}
        onMouseMove={(e) => {
          // to-better/ 在跨单元格时新单元格不应该显示文字选区，应该直接显示单元格选区
          if (tblSelStart) {
            const endNode = getTableCellNode(editor, e.target as HTMLElement);
            if (endNode[1]) updateSelection(endNode[1]);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowCtxMenu(true);
          // console.log(';; ctx-menu-pos-clientX-pageY ', e, e.clientX, e.clientY, e.pageY);
          setMenuPosition({
            left: e.clientX,
            top: e.clientY,
            pageY: e.pageY,
          });
        }}
      >
        <tbody>{children}</tbody>
      </table>
      <div
        className={cellSelectionCss}
        style={{
          display: `${showTblSel ? 'block' : 'none'}`,
          top: `${selBound.y}px`,
          left: `${selBound.x}px`,
          width: `${selBound.right - selBound.left}px`,
          height: `${selBound.bottom - selBound.top}px`,
        }}
      />
      <ContextMenu
        visible={showCtxMenu}
        // visible={true}
        position={menuPosition}
        editor={editor}
        selectCells={selectCells}
      />
    </div>
  );
}

const rootTableCss = css`
  position: relative;
  font-size: 85%;

  & table,
  & th,
  & td {
    border: 1px solid ${themed.color.text.body};
  }

  & table {
    width: 100%;
    table-layout: fixed;
    border-collapse: collapse;
  }
`;

const tableActiveSelectionCss = css`
  & tr ::selection {
    color: inherit;
    background: none;
  }
`;

const cellSelectionCss = css`
  position: absolute;
  z-index: 1;
  box-sizing: border-box;
  outline-offset: -2px;
  background: rgb(0 106 254 / 5%);
  pointer-events: none;
`;
