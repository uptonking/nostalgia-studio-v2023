import React from 'react';

import { css } from '@linaria/core';
import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from '@tanstack/react-query';
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

import {
  fetchVirtualPagesData,
  Person,
  PersonApiResponse,
} from '../utils/makeData';

const fetchSize = 10;

const queryClient = new QueryClient();

/**
 * tanstack-table + tanstack-query + tanstack-virtual
 */
export const A5b4VirtualQuery = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <VirtualPage />
    </QueryClientProvider>
  );
};

function VirtualPage() {
  const rerender = React.useReducer(() => ({}), {})[1];

  //we need a reference to the scrolling element for logic down below
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const [sorting, setSorting] = React.useState<SortingState>([]);

  const columns = React.useMemo<ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 60,
      },
      {
        accessorKey: 'firstName',
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.lastName,
        id: 'lastName',
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
      },
      {
        accessorKey: 'age',
        header: () => 'Age',
        size: 50,
      },
      {
        accessorKey: 'visits',
        header: () => <span>Visits</span>,
        size: 50,
      },
      {
        accessorKey: 'status',
        header: 'Status',
      },
      {
        accessorKey: 'progress',
        header: 'Profile Progress',
        size: 80,
      },
      {
        accessorKey: 'createdAt',
        header: 'Created At',
        cell: (info) => info.getValue<Date>().toLocaleString(),
      },
    ],
    [],
  );

  const { data, fetchNextPage, isFetching, isLoading, hasNextPage } =
    useInfiniteQuery<PersonApiResponse>({
      queryKey: ['table-data', sorting], //adding sorting state as key causes table to reset and fetch from new beginning upon sort
      queryFn: async ({ pageParam = 0 }) => {
        const start = pageParam * fetchSize;
        const fetchedData = fetchVirtualPagesData(start, fetchSize, sorting); //pretend api call
        // console.log(';; fake ', fetchedData)

        await new Promise((r) => setTimeout(r, 500));

        return fetchedData;
      },
      getNextPageParam: (_lastGroup, groups) => groups.length,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      networkMode: 'always'
    });

  // we must flatten the array of arrays from the useInfiniteQuery hook
  const flatData = React.useMemo(
    () => data?.pages?.flatMap((page) => page.data) ?? [],
    [data],
  );
  const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
  const totalFetched = flatData.length;

  // called on scroll and possibly on mount to fetch more data as the user scrolls and reaches bottom of table
  const fetchMoreOnBottomReached = React.useCallback(
    (containerRefElement?: HTMLDivElement | null) => {
      if (containerRefElement) {
        const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
        // console.log(
        //   ';; effect-fetch ',
        //   scrollHeight,
        //   scrollTop,
        //   clientHeight,
        //   scrollHeight - scrollTop - clientHeight < 300,
        //   isFetching,
        // );

        //once the user has scrolled within 300px of the bottom of the table, fetch more data if there is any
        if (
          scrollHeight - scrollTop - clientHeight < 300 &&
          !isFetching &&
          totalFetched < totalDBRowCount
        ) {
          fetchNextPage();
        }
      }
    },
    [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
  );

  //a check on mount and after a fetch to see if the table is already scrolled to the bottom and immediately needs to fetch more data
  React.useEffect(() => {
    fetchMoreOnBottomReached(tableContainerRef.current);
  }, [fetchMoreOnBottomReached]);

  const table = useReactTable({
    data: flatData,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const { rows } = table.getRowModel();

  // console.log(';; rows ', data, columns, rows);


  // Virtualizing is optional, but might be necessary if we are going to potentially have hundreds or thousands of rows
  const virtualizer = useVirtualizer({
    getScrollElement: () => tableContainerRef.current,
    count: rows.length,
    estimateSize: () => 30,
    overscan: 2,
  });

  // 测试表明这里不能memo
  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  // const virtualRows = React.useMemo(
  //   () => rowVirtualizer.getVirtualItems(),
  //   [rowVirtualizer],
  // );

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  if (isLoading) {
    return <>Loading...</>;
  }

  return (
    <div className={tableRefCss}>
      <div className='p-2'>
        <div className='h-2' />
        <div
          ref={tableContainerRef}
          id='idTbFixedHeight'
          onScroll={(e) => {
            // console.log(';; scroll-fetch ');
            fetchMoreOnBottomReached(e.target as HTMLDivElement);
          }}
          className={tableContainerCss}
        >
          <table>
            <thead>
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
              {paddingTop > 0 && (
                <tr>
                  <td style={{ height: `${paddingTop}px` }} />
                </tr>
              )}
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index] as Row<Person>;
                return (
                  <tr key={row.id}>
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
              {paddingBottom > 0 && (
                <tr>
                  <td style={{ height: `${paddingBottom}px` }} />
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div>
          Fetched {flatData.length} of {totalDBRowCount} Rows.
        </div>
        <div>
          <button onClick={() => rerender()}>Force Rerender</button>
        </div>
      </div>
    </div>
  );
}

export const tableContainerCss = css`
  overflow: auto;
  max-width: 900px;
  height: 500px;
  /* border: 1px solid lightgray; */
  color: #313131;
  font-family: arial, sans-serif;
  /* 👀 字体会决定单元格高度，从而影响行高，下面的一些特殊字体可能导致表格每行高度不同 */
  /* font-family: system-ui, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'; */
  /* font-family: Inter, Roboto, -apple-system, BlinkMacSystemFont, "avenir next", avenir, "segoe ui", "helvetica neue", helvetica, Ubuntu, noto, arial, sans-serif; */
`;

export const tableRefCss = css`
  table {
    table-layout: fixed;
    width: 100%;
    /** applies only when border-collapse is separate */
    border-spacing: 0;
    border: 1px solid #dee2e6;
  }

  thead {
    position: sticky;
    top: 0;
    margin: 0;
    background-color: #f1f3f5;
    th {
      text-align: left;
    }
  }

  th,
  td {
    margin: 0;
    padding: 0px;
    padding-left: 8px;
    border-bottom: 1px solid #dee2e6;
    border-right: 1px solid #dee2e6;

    :last-child {
      border-right: 0;
    }
  }
`;
