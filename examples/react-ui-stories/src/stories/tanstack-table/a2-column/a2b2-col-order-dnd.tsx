import React, { useCallback, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  ColumnDef,
  ColumnOrderState,
  flexRender,
  getCoreRowModel,
  Header,
  Table,
  useReactTable,
} from '@tanstack/react-table';

import { tableBaseCss } from '../examples.styles';
import { makeData, Person } from '../utils/makeData';

const defaultColumns: ColumnDef<Person>[] = [
  {
    accessorKey: 'firstName',
    id: 'firstName',
    header: 'First Name',
    cell: (info) => info.getValue(),
    footer: (props) => props.column.id,
  },
  {
    accessorFn: (row) => row.lastName,
    id: 'lastName',
    cell: (info) => info.getValue(),
    header: () => <span>Last Name</span>,
    footer: (props) => props.column.id,
  },
  {
    accessorKey: 'age',
    id: 'age',
    header: 'Age',
    footer: (props) => props.column.id,
  },

  {
    accessorKey: 'visits',
    id: 'visits',
    header: 'Visits',
    footer: (props) => props.column.id,
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: 'Status',
    footer: (props) => props.column.id,
  },
  {
    accessorKey: 'progress',
    id: 'progress',
    header: 'Profile Progress',
    footer: (props) => props.column.id,
  },
];

const reorderColumn = (
  draggedColumnId: string,
  targetColumnId: string,
  columnOrder: string[],
): ColumnOrderState => {
  columnOrder.splice(
    columnOrder.indexOf(targetColumnId),
    0,
    columnOrder.splice(columnOrder.indexOf(draggedColumnId), 1)[0] as string,
  );
  return [...columnOrder];
};

const ColumnHeaderDragOverlay = ({ header, activeId }) => {
  const [styles, setStyles] = useState({});

  useLayoutEffect(() => {
    if (activeId) {
      const elem: HTMLElement = document.querySelector(`#${activeId}`);
      setStyles({
        width: elem.offsetWidth,
        height: elem.offsetHeight,
      });
    } else {
      setStyles({});
    }
  }, [activeId]);

  return createPortal(
    <DragOverlay debug={true}>
      {activeId ? (
        <th
          colSpan={header.colSpan}
          style={{
            display: 'flex',
            border: '1px solid black',
            backgroundColor: '#fff',
            ...styles,
          }}
        >
          <div>
            {header.isPlaceholder
              ? null
              : flexRender(header.column.columnDef.header, header.getContext())}
            <button>⠿</button>
          </div>
        </th>
      ) : null}
    </DragOverlay>,
    document.body,
  );
};

const DraggableColumnHeader = ({
  header,
  table,
}: {
  header: Header<Person, unknown>;
  table: Table<Person>;
}) => {
  const { column } = header;

  const {
    attributes,
    isDragging,
    transform,
    setNodeRef: setDragRef,
    listeners,
  } = useDraggable({
    id: column.id,
    // data: { column },
  });

  const { isOver, setNodeRef: setDropRef } = useDroppable({
    id: column.id,
    // data: { column },
  });

  return (
    <th
      ref={setDropRef}
      id={column.id}
      colSpan={header.colSpan}
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? 'lavender' : undefined,
        // transform: transform ? CSS.Translate.toString(transform) : undefined,
      }}
    >
      <div>
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        <button ref={setDragRef} {...attributes} {...listeners}>
          ⠿
        </button>
      </div>
    </th>
  );
};

/**
 * ✨ 示例，使用dnd-kit实现拖拽列的顺序
 */
export const A2b2ColumnOrderDnd = () => {
  const [data, setData] = React.useState(() => makeData(20));
  const regenerateData = () => setData(() => makeData(20));
  const [columns] = React.useState(() => [...defaultColumns]);

  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>(
    //must start out with populated columnOrder so we can splice
    columns.map((column) => column.id as string),
  );

  const resetColumnOrder = () =>
    setColumnOrder(columns.map((column) => column.id as string));

  const table = useReactTable({
    data,
    columns,
    state: {
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  const [draggingColumnId, setDraggingColumnId] = useState('');
  const sensors = useSensors(useSensor(PointerSensor));

  function handleDragStart(event: DragStartEvent) {
    setDraggingColumnId(String(event.active.id));
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const newColumnOrder = reorderColumn(
        String(active.id),
        String(over.id),
        columnOrder,
      );
      table.setColumnOrder(newColumnOrder);
      setDraggingColumnId('');
    },
    [columnOrder, table],
  );

  return (
    <div className={tableBaseCss}>
      <h3> column order dnd example with react-dnd </h3>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className='p-2'>
          <div className='h-4' />
          <div className='flex flex-wrap gap-2'>
            <button onClick={() => regenerateData()} className='border p-1'>
              Regenerate
            </button>
            <button onClick={() => resetColumnOrder()} className='border p-1'>
              Reset Order
            </button>
          </div>
          <div className='h-4' />
          <table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <DraggableColumnHeader
                      key={header.id}
                      header={header}
                      table={table}
                    />
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              {table.getFooterGroups().map((footerGroup) => (
                <tr key={footerGroup.id}>
                  {footerGroup.headers.map((header) => (
                    <th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.footer,
                          header.getContext(),
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </tfoot>
          </table>
          <pre>{JSON.stringify(table.getState().columnOrder, null, 2)}</pre>
        </div>
        <ColumnHeaderDragOverlay
          activeId={draggingColumnId}
          header={table
            .getFlatHeaders()
            .find((item) => item.id === draggingColumnId)}
        />
      </DndContext>
    </div>
  );
};
