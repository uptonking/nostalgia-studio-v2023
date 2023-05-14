import React from 'react';

import { css } from '@linaria/core';
import {
  ColumnDef,
  ColumnResizeMode,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';

import { tableBaseCss } from '../examples.styles';

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const defaultData: Person[] = [
  {
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
];

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

/**
 * ✨ resize column with `onMouseDown`
 * - onEnd模式下，拖拽时指示线变化但列宽不变
 */
export function A2b3ColWithResize() {
  const rerender = React.useReducer(() => ({}), {})[1];

  const [data] = React.useState(() => [...defaultData]);
  const [columns] = React.useState<ColumnDef<Person>[]>(() => [
    ...defaultColumns,
  ]);

  const [columnResizeMode, setColumnResizeMode] =
    React.useState<ColumnResizeMode>('onChange');

  const table = useReactTable({
    data,
    columns,
    columnResizeMode,
    getCoreRowModel: getCoreRowModel(),
    debugTable: true,
    debugHeaders: true,
    debugColumns: true,
  });

  return (
    <div className={tableBaseCss}>
      <select
        value={columnResizeMode}
        onChange={(e) =>
          setColumnResizeMode(e.target.value as ColumnResizeMode)
        }
        className='border p-2 border-black rounded'
      >
        <option value='onEnd'>Resize: "onEnd"</option>
        <option value='onChange'>Resize: "onChange"</option>
      </select>
      <div className='text-xl'>{'✨ <table/> element'}</div>
      <div>
        <table
          {...{
            style: {
              width: table.getCenterTotalSize(),
            },
          }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    {...{
                      // position: 'relative',
                      className: thCss,
                      style: {
                        // 💡 dynamic column width
                        width: header.getSize(),
                      },
                      colSpan: header.colSpan,
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    <div
                      {...{
                        // 👇🏻 resize column
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className: `${resizerCss} ${
                          header.column.getIsResizing()
                            ? resizerIsResizingCss
                            : ''
                        }`,
                        style: {
                          transform:
                            columnResizeMode === 'onEnd' &&
                            header.column.getIsResizing()
                              ? `translateX(${
                                  table.getState().columnSizingInfo.deltaOffset
                                }px)`
                              : '',
                        },
                      }}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    {...{
                      style: {
                        width: cell.column.getSize(),
                      },
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <br />
      <br />
      <div className='text-xl'>{'✨ <div/> (position: relative)'}</div>
      <div className='overflow-x-auto'>
        <div
          {...{
            style: {
              width: table.getTotalSize(),
            },
          }}
        >
          <div>
            {table.getHeaderGroups().map((headerGroup) => (
              <div
                key={headerGroup.id}
                {...{
                  className: trCss,
                }}
              >
                {headerGroup.headers.map((header) => (
                  <div
                    key={header.id}
                    {...{
                      className: thTdCss + ' ' + thCss,
                      style: {
                        width: header.getSize(),
                      },
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    <div
                      {...{
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className: `${resizerCss} ${
                          header.column.getIsResizing()
                            ? resizerIsResizingCss
                            : ''
                        }`,
                        style: {
                          transform:
                            columnResizeMode === 'onEnd' &&
                            header.column.getIsResizing()
                              ? `translateX(${
                                  table.getState().columnSizingInfo.deltaOffset
                                }px)`
                              : '',
                        },
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div>
            {table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                {...{
                  className: trCss,
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    {...{
                      className: thTdCss + ' ',
                      style: {
                        width: cell.column.getSize(),
                      },
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <br />
      <br />
      <div className='text-xl'>{'✨ <div/> (position: absolute)'}</div>
      <div className='overflow-x-auto'>
        <div
          {...{
            style: {
              width: table.getTotalSize(),
            },
          }}
        >
          <div>
            {table.getHeaderGroups().map((headerGroup) => (
              <div
                key={headerGroup.id}
                {...{
                  className: trCss,
                  style: {
                    position: 'relative',
                    height: 32,
                  },
                }}
              >
                {headerGroup.headers.map((header) => (
                  <div
                    key={header.id}
                    {...{
                      className: thTdCss + ' ' + thCss,
                      style: {
                        position: 'absolute',
                        left: header.getStart(),
                        width: header.getSize(),
                        // use fixed height to make empty th filled
                        height: 32,
                      },
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                    <div
                      {...{
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        className: `${resizerCss} ${
                          header.column.getIsResizing()
                            ? resizerIsResizingCss
                            : ''
                        }`,
                        style: {
                          transform:
                            columnResizeMode === 'onEnd' &&
                            header.column.getIsResizing()
                              ? `translateX(${
                                  table.getState().columnSizingInfo.deltaOffset
                                }px)`
                              : '',
                        },
                      }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div>
            {table.getRowModel().rows.map((row) => (
              <div
                key={row.id}
                {...{
                  className: trCss,
                  style: {
                    position: 'relative',
                    height: 32,
                  },
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <div
                    key={cell.id}
                    {...{
                      className: thTdCss,
                      style: {
                        position: 'absolute',
                        left: cell.column.getStart(),
                        width: cell.column.getSize(),
                      },
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className='h-4' />
      <button onClick={() => rerender()} className='border p-2'>
        Rerender
      </button>
      <pre>
        {JSON.stringify(
          {
            columnSizing: table.getState().columnSizing,
            columnSizingInfo: table.getState().columnSizingInfo,
          },
          null,
          2,
        )}
      </pre>
    </div>
  );
}

const trCss = css`
  display: flex;
`;

const thTdCss = css`
  padding: 0.5rem;
  box-shadow: inset 0 0 0 1px black;
`;

const thCss = css`
  position: relative;
`;

const resizerCss = css`
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 5px;
  background: lightgray;
  cursor: col-resize;
  user-select: none;
  touch-action: none;
  /* opacity: 0; */
  opacity: 1;

  &:hover {
    opacity: 1;
  }
`;

const resizerIsResizingCss = css`
  background: royalblue;
  opacity: 1;
`;
