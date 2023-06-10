import React, {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { isHotkey } from 'is-hotkey';
import { type Location, Path, Transforms } from 'slate';
import { ReactEditor, type RenderElementProps, useSlate } from 'slate-react';

import { type TableElement } from '../customTypes';
import { ContextMenu } from '../menu/ContextMenu';
import {
  getTableCellNode,
  isEditableInTable,
  isSelectionInTable,
  setTableNodeOrigin,
} from '../utils/common';
import {
  handleKeyArrowDownPress,
  handleKeyArrowUpPress,
} from '../utils/keyboard';
import { getRealPathFromTableSelection } from '../utils/selection';
import { selectionBound } from '../utils/selectionBound';

/**
 * table with context menu
 * - 自绘表格选区
 *
 * todo
 * - 统一editor.selection和单元格选区selectCells
 */
export function CustomTable(props: RenderElementProps) {
  const { attributes, children, element } = props;
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
  const [menuPosition, setMenuPosition] = useState({
    left: -9999,
    top: -9999,
  });

  const editor = useSlate();
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent<HTMLTableElement>) => {
      const editorDom = ReactEditor.toDOMNode(editor, editor);
      // console.log(';; tbKeyDown');

      if (
        !isEditableInTable(editor) &&
        !isHotkey(['delete', 'backspace'], e) &&
        editorDom.getAttribute('contenteditable') === 'true'
      ) {
        // /非 delete backspace 按键时
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
    <div className='yt-e-table-wrap' {...attributes}>
      <table
        ref={tblRef}
        className={`yt-e-table${showTblSel ? ' ye-e-table-selected' : ''}`}
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
          // to-enhance 在跨单元格时新单元格不应该显示文字选区，应该直接显示单元格选区
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
