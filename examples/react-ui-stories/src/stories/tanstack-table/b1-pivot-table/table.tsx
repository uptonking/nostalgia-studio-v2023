import React, { useMemo } from 'react';

import cx from 'clsx';

import { css } from '@linaria/core';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import { Cell } from './cell-categories/cell';
import { Header } from './header-menu/header';
import { PlusIcon } from './icons';
import { ActionNames } from './utils';

// import { FixedSizeList } from 'react-window';
// import scrollbarWidth from './scrollbarWidth';

const defaultColumn = {
  cell: Cell,
  header: Header,
  sortType: 'alphanumericFalsyLast',
  minSize: 50,
  size: 150,
  maxSize: 400,
} as any;

export function Table({ columns, data, dispatch: dataDispatch, skipReset }) {
  const sortTypes = useMemo(
    () => ({
      alphanumericFalsyLast(rowA, rowB, columnId, desc) {
        if (!rowA.values[columnId] && !rowB.values[columnId]) {
          return 0;
        }

        if (!rowA.values[columnId]) {
          return desc ? -1 : 1;
        }

        if (!rowB.values[columnId]) {
          return desc ? 1 : -1;
        }

        return isNaN(rowA.values[columnId])
          ? rowA.values[columnId].localeCompare(rowB.values[columnId])
          : rowA.values[columnId] - rowB.values[columnId];
      },
    }),
    [],
  );

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
    debugTable: true,
    // defaultColumn,
    // dataDispatch,
    // autoResetSortBy: !skipReset,
    // autoResetFilters: !skipReset,
    // autoResetRowState: !skipReset,
    // sortTypes,
  });

  const rows = table.getRowModel().rows;
  const headerGroups = table.getHeaderGroups();
  console.log(';; col-data ', columns, data, rows, headerGroups);

  const RenderRow = React.useCallback(
    ({ index, style }) => {
      const row = rows[index];
      return (
        <div className={trCss}>
          {row.getVisibleCells().map((cell) => {
            // console.log('cell', cell)
            return (
              <div key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </div>
            );
          })}
        </div>
      );
    },
    [rows],
  );

  function isTableResizing() {
    // for (let headerGroup of headerGroups) {
    //   for (let column of headerGroup.headers) {
    //     if (column.isResizing) {
    //       return true;
    //     }
    //   }
    // }
    return false;
  }

  return (
    <div style={{ maxWidth: '100vw', overflow: 'auto' }}>
      <div
        className={cx(tableCss, isTableResizing() && 'noselect')}
        style={{ width: table.getCenterTotalSize() }}
      >
        <div>
          {headerGroups.map((headerGroup) => (
            <div key={headerGroup.id} className={trCss}>
              {headerGroup.headers.map((header) => {
                // console.log(';; header ', header)
                return (
                  <div
                    key={header.id}
                    className={thCss}
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
            <div key={row.id} className={trCss}>
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
            onClick={() => dataDispatch({ type: ActionNames.ADD_ROW })}
          >
            <span className='svg-icon svg-gray icon-margin'>
              <PlusIcon />
            </span>
            New
          </div>
        </div>
      </div>
    </div>
  );
}

const tableCss = css`
  /* display: inline-block; */
  border-spacing: 0;
`;

const trCss = css`
  display: flex;

  &:last-child .td {
    border-bottom: 0;
  }

  &:first-child .td {
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
`;

const thCss = css`
  color: #9e9e9e;
  font-weight: 500;
  font-size: 0.875rem;
  cursor: pointer;
  border-bottom: 1px solid #e0e0e0;

  &:hover {
    background-color: #f5f5f5;
  }
`;
const thContentCss = css`
  overflow-x: hidden;
  text-overflow: ellipsis;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  height: 50px;
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

const addRowCss = css`
  display: flex;
  height: 50px;
  color: #9e9e9e;
  padding: 0.5rem;
  align-items: center;
  font-size: 0.875rem;
  cursor: pointer;
  border: 1px solid #e0e0e0;
  &:hover {
    background-color: #f5f5f5;
  }
`;
