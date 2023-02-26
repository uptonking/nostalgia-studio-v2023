import './table.css';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import cx from 'classnames';
import { Editor, NodeEntry, Path, Range, Transforms } from 'slate';
import {
  RenderElementProps,
  useEditor,
  useSelected,
  useSlate,
  useSlateStatic,
} from 'slate-react';

import { options } from './options';
import { addSelection, removeSelection } from './selection';
import { HorizontalToolbar, TableCardbar, VerticalToolbar } from './ui';

/**
 * table-row/cell view entry
 */
export const Table = (props) => {
  const { attributes, children, element } = props;
  const selected = useSelected();
  const editor = useSlateStatic();

  switch (element.type) {
    case 'table': {
      let existSelectedCell = false;
      let table: NodeEntry | null = null;

      if (selected && editor.selection) {
        [table] = Editor.nodes(editor, {
          // @ts-expect-error fix-types
          match: (n) => n.type === 'table',
          at: Editor.path(editor, editor.selection),
        });

        if (table) {
          const [selectedCell] = Editor.nodes(editor, {
            at: Editor.range(editor, table[1]),
            // @ts-expect-error fix-types
            match: (n) => n.selectedCell,
          });

          if (selectedCell) {
            existSelectedCell = true;
          }
        }
      }

      return (
        <div style={{ position: 'relative' }} {...attributes}>
          <TableCardbar
            className={cx({ selected: selected || existSelectedCell })}
          />
          <TableComponent {...props} table={table}>
            {children}
          </TableComponent>
        </div>
      );
    }

    case 'table-row': {
      return (
        <tr
          {...attributes}
          className='table-tr'
          slate-table-element='tr'
          data-key={element.key}
          onDrag={(e) => e.preventDefault()}
        >
          {children}
        </tr>
      );
    }

    case 'table-cell': {
      console.log(';; cell ', props);

      return (
        <CellComponent
          {...props}
        >
          {children}
        </CellComponent>
      );
    }

    case 'table-content': {
      return (
        <div slate-table-element='content' className='table-content'>
          {children}
        </div>
      );
    }

    default:
      return <p {...props} />;
  }
};

const TableComponent = (props: RenderElementProps) => {
  // @ts-expect-error fix-types
  const { table, children } = props;
  const editor = useSlate();
  const selected = useSelected();
  const ref = useRef<HTMLTableElement>(null);

  const resizeTable = useCallback(() => {
    if (ref.current) {
      ref.current.querySelectorAll('td').forEach((cell) => {
        Transforms.setNodes(
          editor,
          {
            // @ts-expect-error fix-types
            width: cell.offsetWidth,
            height: cell.offsetHeight,
          },
          {
            at: [],
            // @ts-expect-error fix-types
            match: (n) => n.key === cell.dataset.key,
          },
        );
      });
    }
  }, [editor]);

  useEffect(() => {
    resizeTable();
  }, [resizeTable, selected, editor.selection]);

  useEffect(() => {
    if (!selected) removeSelection(editor);
  }, [selected, editor]);

  const [startKey, setStartKey] = useState<string>('');

  const startNode = useMemo(() => {
    const [node] = Editor.nodes(editor, {
      // @ts-expect-error fix-types
      match: (n) => n.key === startKey,
      at: [],
    });

    return node;
  }, [startKey, editor]);

  const ResizeToolbar = useMemo(() => {
    return (
      selected &&
      ref.current &&
      table && (
        <>
          <HorizontalToolbar table={ref.current} tableNode={table} />
          <VerticalToolbar table={ref.current} tableNode={table} />
        </>
      )
    );
  }, [selected, table]);

  return (
    <>
      {ResizeToolbar}
      <table
        className='table'
        slate-table-element='table'
        ref={ref}
        style={options.tableStyle}
        onDragStart={(e) => e.preventDefault()}
        onMouseDown={(e) => {
          const cell = (e.target as HTMLBaseElement).closest('td');
          const key = cell?.getAttribute('data-key') || '';
          setStartKey(key);
        }}
        onMouseMove={(e) => {
          const cell = (e.target as HTMLBaseElement).closest('td');
          if (cell && startKey) {
            const endKey = cell.getAttribute('data-key');

            const [endNode] = Editor.nodes(editor, {
              // @ts-expect-error fix-types
              match: (n) => n.key === endKey,
              at: [],
            });

            addSelection(
              editor,
              table,
              Editor.path(editor, startNode[1]),
              Editor.path(editor, endNode[1]),
            );
          }
        }}
        onMouseUp={() => {
          setStartKey('');
          resizeTable();
        }}
        onMouseLeave={() => {
          setStartKey('');
        }}
      >
        <tbody slate-table-element='tbody'>{children}</tbody>
      </table>
    </>
  );
};

const CellComponent = (props: RenderElementProps) => {

  const { attributes, children, element } = props;
  // @ts-expect-error fix-types
  const { key: dataKey, selectedCell, colspan, rowspan, width, height } = element;

  return (
    <td
      {...attributes}
      className={cx('table-td', { selectedCell })}
      slate-table-element='td'
      data-key={dataKey}
      colSpan={colspan}
      rowSpan={rowspan}
      onDragStart={(e) => e.preventDefault()}
      style={{
        position: 'relative',
        minWidth: '50px',
        width: width ? `${width}px` : 'auto',
        height: width ? `${height}px` : 'auto',
      }}
    >
      {children}
    </td>
  );
};
