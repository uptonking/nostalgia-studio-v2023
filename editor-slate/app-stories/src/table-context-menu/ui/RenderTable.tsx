import React, {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { isHotkey } from 'is-hotkey';
import { Path, Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useSlate } from 'slate-react';

import { TableElement } from '../customTypes';
import { ContextMenu } from '../menu/ContextMenu';
import {
  getTableCellNode,
  isEditableInTable,
  setTableNodeOrigin,
} from '../utils/common';
import { getSelection } from '../utils/selection';
import { selectionBound } from '../utils/selectionBound';

/**
 * table with context menu
 * - 自绘表格选区
 */
export function CustomTable(props: RenderElementProps) {
  const { attributes, children, element } = props;
  const tblRef = useRef<HTMLTableElement>(null);
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
  const [menuPosition, setMenuPosition] = useState({
    left: -9999,
    top: -9999,
  });

  const editor = useSlate();

  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent<HTMLDivElement>) => {
      const editorDom = ReactEditor.toDOMNode(editor, editor);

      if (
        !isEditableInTable(editor) &&
        !isHotkey(['delete', 'backspace'], e) &&
        editorDom.getAttribute('contenteditable') === 'true'
      ) {
        // 非 delete backspace 按键时
        editorDom.setAttribute('contenteditable', 'false');
        Promise.resolve()
          .then(() => editorDom.setAttribute('contenteditable', 'true'))
          .catch(() => { });
      }
    };
    editor.on('keydown', handleKeydown);

    return () => {
      editor.off('keydown', handleKeydown);
    };
  }, [editor]);

  useEffect(() => {
    const mousedownCallback = (e: MouseEvent) => {
      const isTable = e.target && tblRef.current?.contains(e.target as Node);
      if (!isTable || e.button !== 2) {
        // 不在表格位置 || 不是鼠标右键
        // collapse 选区
        Transforms.collapse(editor);
        setShowTblSel(false);
        setShowCtxMenu(false);
        setSelectCells([]);
      }
    };
    const mouseupCallback = () => {
      setTblSelStart(null);
    };

    const blurCallback = () => {
      setShowCtxMenu(false);
    };

    const reset = () => {
      setShowTblSel(false);
      setSelectCells([]);
    };
    if (editor) {
      editor.on('mousedown', mousedownCallback);
      editor.on('blur', blurCallback);
      editor.on('resetTableSelection', reset);
      window.addEventListener('mouseup', mouseupCallback);
    }
    return () => {
      editor.off('mousedown', mousedownCallback);
      editor.off('blur', blurCallback);
      editor.off('resetTableSelection', reset);
      window.removeEventListener('mouseup', mouseupCallback);
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
        getSelection(editor, tblSelStart, endPath, element as TableElement),
      );
    },
    [editor, element, tblSelStart],
  );

  return (
    <div className='yt-e-table-wrap' {...attributes}>
      <table
        ref={tblRef}
        className={`yt-e-table${showTblSel ? ' ye-e-table-selected' : ''}`}
        onDragStart={(e) => e.preventDefault()}
        onMouseDown={(e) => {
          // console.log(';; mouse-down table ', e.target)

          const node = getTableCellNode(editor, e.target as HTMLElement);
          if (!node || e.button !== 0) return;
          setTblSelStart(node[1]);
        }}
        onMouseLeave={() => {
          tblSelStart && setShowTblSel(false);
        }}
        onMouseMove={(e) => {
          // to-enhance 在跨单元格时新单元格不应该显示文字选区，应该直接显示单元格选区
          // e.preventDefault();
          if (tblSelStart) {
            const endNode = getTableCellNode(editor, e.target as HTMLElement);
            if (endNode[1]) updateSelection(endNode[1]);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setShowCtxMenu(true);
          setMenuPosition({
            left: e.clientX,
            top: e.clientY,
          });
        }}
      >
        <tbody>{children}</tbody>
      </table>
      <div
        className='yt-e-table-selection'
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
        position={menuPosition}
        editor={editor}
        selectCells={selectCells}
      />
    </div>
  );
}

