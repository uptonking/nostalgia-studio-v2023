import React, { useEffect, useRef, useState } from 'react';

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  type GroupingState,
  useReactTable,
} from '@tanstack/react-table';

import { tableBaseCss } from '../examples.styles';
import { makeData, type Person } from '../utils/makeData';

/**
 * ✨ group rows by column
 * - 支持分组后再次分组
 */
export const A1b5Group = () => {
  const rerender = React.useReducer(() => ({}), {})[1];

  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        header: 'Name',
        columns: [
          {
            accessorKey: 'firstName',
            header: 'First Name',
            cell: (info) => info.getValue(),
          },
          {
            accessorFn: (row) => row.lastName,
            id: 'lastName',
            header: () => <span>Last Name</span>,
            cell: (info) => info.getValue(),
          },
        ],
      },
      {
        header: 'Info',
        columns: [
          {
            accessorKey: 'age',
            header: () => 'Age',
            aggregatedCell: ({ getValue }) =>
              Math.round(getValue<number>() * 100) / 100,
            aggregationFn: 'median',
          },
          {
            header: 'More Info',
            columns: [
              {
                accessorKey: 'visits',
                header: () => <span>Visits</span>,
                aggregationFn: 'sum',
                // aggregatedCell: ({ getValue }) => getValue().toLocaleString(),
              },
              {
                accessorKey: 'status',
                header: 'Status',
              },
              {
                accessorKey: 'progress',
                header: 'Profile Progress',
                cell: ({ getValue }) =>
                  Math.round(getValue<number>() * 100) / 100 + '%',
                aggregationFn: 'mean',
                aggregatedCell: ({ getValue }) =>
                  Math.round(getValue<number>() * 100) / 100 + '%',
              },
            ],
          },
        ],
      },
    ],
    [],
  );

  // 💡 group时表格数据未修改
  const [data, setData] = React.useState(() => makeData(100000));
  const refreshData = () => setData(() => makeData(100000));

  const [grouping, setGrouping] = React.useState<GroupingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      grouping,
    },
    onGroupingChange: setGrouping,
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    debugTable: true,
  });

  return (
    <div className={tableBaseCss}>
      <div className='p-2'>
        <div className='h-2' />
        <table>
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div>
                          {header.column.getCanGroup() ? (
                            // If the header can be grouped, let's add a toggle
                            <button
                              {...{
                                onClick:
                                  header.column.getToggleGroupingHandler(),
                                style: {
                                  cursor: 'pointer',
                                },
                              }}
                            >
                              {header.column.getIsGrouped()
                                ? `🙏🏻(${header.column.getGroupedIndex()}) `
                                : `👏🏻 `}
                            </button>
                          ) : null}{' '}
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                        </div>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        {...{
                          style: {
                            background: cell.getIsGrouped()
                              ? '#0aff0082'
                              : cell.getIsAggregated()
                                ? '#ffa50078'
                                : cell.getIsPlaceholder()
                                  ? '#ff000042'
                                  : 'white',
                          },
                        }}
                      >
                        {cell.getIsGrouped() ? (
                          // If it's a grouped cell, add an expander and row count
                          <button
                            {...{
                              onClick: row.getToggleExpandedHandler(),
                              style: {
                                cursor: row.getCanExpand()
                                  ? 'pointer'
                                  : 'normal',
                              },
                            }}
                          >
                            {row.getIsExpanded() ? '👇' : '👉'}{' '}
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}{' '}
                            ({row.subRows.length})
                          </button>
                        ) : cell.getIsAggregated() ? (
                          // for aggregated cell, use the Aggregated renderer for cell
                          flexRender(
                            cell.column.columnDef.aggregatedCell ??
                              cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        ) : cell.getIsPlaceholder() ? null : ( // For cells with repeated values, render null
                          // Otherwise, just render the regular cell
                          flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className='h-2' />
        <div className='flex items-center gap-2' style={{ display: 'flex' }}>
          <button
            className='border rounded p-1'
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {'<<'}
          </button>
          <button
            className='border rounded p-1'
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            {'<'}
          </button>
          <button
            className='border rounded p-1'
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {'>'}
          </button>
          <button
            className='border rounded p-1'
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {'>>'}
          </button>
          <span className='flex items-center gap-1' style={{ display: 'flex' }}>
            <div>Page</div>
            <strong>
              {table.getState().pagination.pageIndex + 1} of{' '}
              {table.getPageCount()}
            </strong>
          </span>
          <span className='flex items-center gap-1' style={{ display: 'flex' }}>
            | Go to page:
            <input
              type='number'
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className='border p-1 rounded w-16'
            />
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => {
              table.setPageSize(Number(e.target.value));
            }}
          >
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div>{table.getRowModel().rows.length} Rows</div>
        <div>
          <button onClick={() => rerender()}>Force Rerender</button>
        </div>
        <div>
          <button onClick={() => refreshData()}>Refresh Data</button>
        </div>
        <pre>{JSON.stringify(grouping, null, 2)}</pre>
      </div>
    </div>
  );
};
