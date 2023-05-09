import React, { useCallback, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  Active,
  Announcements,
  closestCenter,
  CollisionDetection,
  defaultDropAnimationSideEffects,
  DndContext,
  DragOverlay,
  DropAnimation,
  KeyboardCoordinateGetter,
  KeyboardSensor,
  MeasuringConfiguration,
  Modifiers,
  MouseSensor,
  PointerActivationConstraint,
  PointerSensor,
  ScreenReaderInstructions,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  AnimateLayoutChanges,
  arrayMove,
  NewIndexGetter,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  SortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  Row,
  useReactTable,
} from '@tanstack/react-table';

import { tableBaseCss } from '../examples.styles';
import { makeData, Person } from '../utils/makeData';

const reorderData = (data, draggedRowIndex: number, targetRowIndex: number) => {
  data.splice(targetRowIndex, 0, data.splice(draggedRowIndex, 1)[0] as Person);
};

const defaultColumns: ColumnDef<Person>[] = [
  {
    header: 'Name',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'firstName',
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
    ],
  },
  {
    header: 'Info',
    footer: (props) => props.column.id,
    columns: [
      {
        accessorKey: 'age',
        header: () => 'Age',
        footer: (props) => props.column.id,
      },
      {
        header: 'More Info',
        columns: [
          {
            accessorKey: 'visits',
            header: () => <span>Visits</span>,
            footer: (props) => props.column.id,
          },
          {
            accessorKey: 'status',
            header: 'Status',
            footer: (props) => props.column.id,
          },
          {
            accessorKey: 'progress',
            header: 'Profile Progress',
            footer: (props) => props.column.id,
          },
        ],
      },
    ],
  },
];

const RowDragOverlay = ({ activeId, row }) => {
  const [styles, setStyles] = useState({});

  useLayoutEffect(() => {
    if (activeId) {
      const elem: HTMLElement = document.querySelector(`#row${activeId}`);
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
        <tr
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            backgroundColor: '#fff',
            ...styles,
          }}
        >
          <td>
            <button>⠿</button>
          </td>
          {row.getVisibleCells().map((cell) => (
            <td key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ) : null}
    </DragOverlay>,
    document.body,
  );
};

type DraggableRowProps = {
  id: string;
  index: number;
  row: Row<Person>;
  reorderRow?: (draggedRowIndex: number, targetRowIndex: number) => void;
};

const DraggableRow = ({ id, index, row }: DraggableRowProps) => {
  const {
    active,
    attributes,
    isDragging,
    isSorting,
    listeners,
    isOver,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  return (
    <tr
      ref={setNodeRef} //previewRef could go here
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? 'lavender' : undefined,
      }}
      data-index={index}
      data-id={id}
      id={'row' + id}
      {...attributes}
      {...listeners}
    >
      <td>
        <button ref={setActivatorNodeRef}>⠿</button>
      </td>
      {row.getVisibleCells().map((cell) => (
        <td key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
};

export function A3b1RowDnd() {
  const [columns] = React.useState(() => [...defaultColumns]);
  const [data, setData] = React.useState(() => makeData(20));
  const rerender = () => setData(() => makeData(20));

  const reorderRow = useCallback(
    (draggedRowIndex: number, targetRowIndex: number) => {
      reorderData(data, draggedRowIndex, targetRowIndex);
      setData([...data]);
    },
    [data],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    //good to have guaranteed unique row ids/keys for rendering
    getRowId: (row) => String(row.id),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });
  window['data'] = data;

  const sensors = useSensors(useSensor(PointerSensor));
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const getIndex = useCallback(
    (id: UniqueIdentifier) => data.findIndex((item) => String(item.id) === id),
    [data],
  );
  const activeIndex = activeId ? getIndex(activeId) : -1;
  // console.log(';; dragStart ', activeId, activeIndex)

  const handleDragStart = useCallback((event) => {
    const { active } = event;
    if (!active) {
      return;
    }
    setActiveId(active.id);
  }, []);

  const handleDragEnd = useCallback(
    (event) => {
      const { over } = event;
      setActiveId(null);
      if (over) {
        const overIndex = getIndex(over.id);
        // console.log(';; dragEnd ', activeIndex, overIndex, over)
        if (activeIndex !== overIndex) {
          reorderRow(activeIndex, overIndex);
          // setItems((items) => reorderItems(items, activeIndex, overIndex));
        }
      }
    },
    [activeIndex, getIndex, reorderRow],
  );

  return (
    <div className={tableBaseCss}>
      <div className='h-4' />
      <div className='flex flex-wrap gap-2'>
        <button onClick={() => rerender()} className='border p-1'>
          Regenerate
        </button>
      </div>
      <div className='h-4' />
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={data.map((i) => i.id)}>
          <table>
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  <th />
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row, index) => (
                <DraggableRow
                  key={row.id}
                  id={row.id}
                  row={row}
                  reorderRow={reorderRow}
                  index={index}
                />
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
          <RowDragOverlay
            activeId={activeId}
            row={table
              .getRowModel()
              .flatRows.find((item) => item.id === activeId)}
          />
        </SortableContext>
      </DndContext>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
