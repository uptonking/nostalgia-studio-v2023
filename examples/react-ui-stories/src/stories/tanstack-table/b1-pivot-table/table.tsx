import React, { useMemo } from 'react';

import cx from 'clsx';

import { css } from '@linaria/core';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type RowData,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { Cell } from './cell-types/cell';
import { Header } from './header-menu/header';
import { PlusIcon } from './icons';
import { ACTION_TYPES } from './utils';

const defaultColumn = {
  cell: Cell,
  header: Header,
  minSize: 50,
  size: 150,
  maxSize: 400,
} as any;

export function Table({ columns, data, dispatch: dataDispatch, skipReset }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    columns,
    data,
    state: {
      sorting,
    },
    defaultColumn,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    columnResizeMode: 'onChange',
    meta: {
      dataDispatch,
    },
    debugTable: true,
  });

  const { rows } = table.getRowModel();
  const headerGroups = table.getHeaderGroups();
  // console.log(';; col-data ', columns, data, rows, headerGroups);

  const isTableResizing = useMemo(() => {
    for (const headerGroup of headerGroups) {
      for (const { column } of headerGroup.headers) {
        if (column.getIsResizing()) {
          return true;
        }
      }
    }
    return false;
  }, [headerGroups]);

  return (
    <div
    // style={{ maxWidth: '100vw', overflow: 'auto' }} // useful for virtualize
    >
      <div
        className={cx(tableCss, { [noSelectCss]: isTableResizing })}
        style={{ width: table.getCenterTotalSize() }}
      >
        <div>
          {headerGroups.map((headerGroup) => (
            <div className={trCss} key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                // console.log(';; header ', header)
                return (
                  <div
                    className={cx(thTdCss, thCss)}
                    key={header.column.id}
                    {...{
                      colSpan: header.colSpan,
                      style: {
                        position: 'relative',
                        // 💡 dynamic column width
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
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        <div>
          {rows.map((row) => (
            <div className={trCss} key={row.id}>
              {row.getVisibleCells().map((cell) => {
                // console.log('cell', cell)
                return (
                  <div
                    key={cell.id}
                    className={cx(thTdCss, tdCss)}
                    {...{
                      style: {
                        display: 'inline-block',
                        width: cell.column.getSize(),
                      },
                    }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                );
              })}
            </div>
          ))}
          <div
            className={cx(trCss, addRowCss)}
            onClick={() => dataDispatch({ type: ACTION_TYPES.Add_row })}
          >
            <span className='svg-icon svg-gray icon-margin'>
              <PlusIcon />
            </span>
            New Row
          </div>
        </div>
      </div>
    </div>
  );
}

const tableCss = css`
  border-spacing: 0;
`;

const tdCss = css`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
  color: #424242;
`;

const tdContentCss = css`
  display: block;
`;

const trCss = css`
  display: flex;

  &:last-child ${tdCss} {
    border-bottom: 0;
  }

  &:first-child ${tdCss} {
    border-top: 0;
  }
`;

const thTdCss = css`
  position: relative;
  display: inline-block;
  margin: 0;
  white-space: nowrap;
  border-left: 1px solid #e0e0e0;
  border-top: 1px solid #e0e0e0;
  &:last-child {
    border-right: 1px solid #e0e0e0;
  }
`;

const thCss = css`
  color: #9e9e9e;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const addRowCss = css`
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  color: #9e9e9e;
  font-size: 0.875rem;
  cursor: pointer;
  &:hover {
    background-color: #f5f5f5;
  }

  & svg {
    margin-top: 4px;
    margin-right: 8px;
  }
`;

const noSelectCss = css`
  user-select: none;
`;
declare module '@tanstack/react-table' {
  interface TableMeta<TData extends RowData> {
    dataDispatch?: any;
  }
}
