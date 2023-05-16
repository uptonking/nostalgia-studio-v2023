import React from 'react';

import { css } from '@linaria/core';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';

import { tableBaseCss } from '../examples.styles';
import { makeData, Person, tableColumns } from '../utils/makeData';

const MOCK_DATA_LEN = 20;

/**
 * ✨ virtualized表格，每行高度不同
 * - createdAt列内容文本会换行，不便于分析高度
 */
export function A5b2VirtualDynamic() {
  const rerender = React.useReducer(() => ({}), {})[1];

  const columns = React.useMemo<ColumnDef<Person>[]>(() => tableColumns, []);

  const [data, setData] = React.useState(() => makeData(MOCK_DATA_LEN));
  const refreshData = () => setData(() => makeData(MOCK_DATA_LEN));

  return (
    <div className={tableBaseCss + ' ' + rootCss}>
      <div className='p-2'>
        <div>
          <p>
            This demo shows a virtualised table with 50,000 rows. There are two
            versions, one is a fixed height table using{' '}
            <strong>useVirtualizer</strong>, the other is a window height table
            using <strong>useWindowVirtualizer</strong>.
          </p>
        </div>
        <div className='h-2' />
        <DynamicHeightTable data={data} columns={columns} height={240} />
        <div>{data.length} Rows</div>
        <div>
          <button onClick={() => rerender()}>Force Rerender</button>
        </div>
        <div>
          <button onClick={() => refreshData()}>Refresh Data</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Renders variable height virtualized table, with sorting
 * - 每行高度是在渲染后dynamically measure计算得到
 */
export function DynamicHeightTable({ data, columns, height = 240 }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 30,
    // overscan: 2,
  });

  /** current minimal rows to render */
  const virtualRows = rowVirtualizer.getVirtualItems();
  /** total hight of all rows (including invisible rows) */
  const totalSize = rowVirtualizer.getTotalSize();

  console.log(';; rows ', totalSize, rows, virtualRows, rowVirtualizer);

  return (
    <div
      ref={tableContainerRef}
      id='vTbFixedHeight'
      className='container'
      style={{ height }}
      // style={{ height, width: 640 }}
    >
      <div
        style={{
          height: rowVirtualizer.getTotalSize(),
          width: '100%',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            transform: `translateY(${virtualRows[0].start}px)`,
          }}
        >
          <table>
            <thead className='sticky-header'>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <th
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{ width: header.getSize() }}
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            {...{
                              className: header.column.getCanSort()
                                ? 'cursor-pointer select-none'
                                : '',
                              onClick: header.column.getToggleSortingHandler(),
                            }}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{
                              asc: ' 🔼',
                              desc: ' 🔽',
                            }[header.column.getIsSorted() as string] ?? null}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index] as Row<Person>;
                return (
                  <tr
                    key={row.id}
                    data-index={row.id}
                    // 👇🏻 measure row height dynamically; callback ref在useLayoutEffect前执行
                    ref={rowVirtualizer.measureElement}
                    // style={{ height: virtualRow.index % 2 === 0 ? 60 : 40 }}
                    style={{ height: 25 + row.original.age }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      return (
                        <td key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export const rootCss = css`
  .sticky-header {
    position: sticky;
    top: 0;
    background-color: beige;
  }
  /* unused */
  .fixed-header {
    position: fixed;
    top: 0;
    z-index: 1;
    width: 900px;
  }

  #vTbFixedHeight {
    border: 1px solid lightgray;
    max-width: 900px !important;
    overflow: auto;
  }
`;
