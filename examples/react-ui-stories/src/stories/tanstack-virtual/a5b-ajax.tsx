import React, { useMemo } from 'react';

import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
} from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';

import { listCss, listItemCss, listItemEvenCss } from './styles';

async function fetchServerPage(
  limit: number,
  offset: number = 0,
): Promise<{ rows: string[]; nextOffset: number }> {
  const rows = new Array(limit)
    .fill(0)
    .map((e, i) => `Async loaded row #${i + offset * limit}`);

  await new Promise((r) => setTimeout(r, 500));

  return { rows, nextOffset: offset + 1 };
}

const queryClient = new QueryClient();

export const A5b1VirtualQuery = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <InfiniteScroll />
    </QueryClientProvider>
  );
};

export function InfiniteScroll() {
  const scrollElemRef = React.useRef();

  const {
    status,
    data,
    error,
    isFetching,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey: ['infiniteScroll'],
    queryFn: (ctx) => fetchServerPage(10, ctx.pageParam),
    getNextPageParam: (_lastGroup, groups) => groups.length,
    networkMode: 'always'
  });



  const allRows = data ? data.pages.flatMap((d) => d.rows) : [];

  // console.log(';; fetchData ', data, allRows)

  const virtualizer = useVirtualizer({
    count: hasNextPage ? allRows.length + 1 : allRows.length,
    getScrollElement: () => scrollElemRef.current,
    estimateSize: () => 40,
    overscan: 5,
  });

  // 👀 won't work
  // const virtualItems = useMemo(
  //   () => rowVirtualizer.getVirtualItems(),
  //   [rowVirtualizer],
  // );

  React.useEffect(() => {
    const [lastItem] = [...virtualizer.getVirtualItems()].reverse();
    if (!lastItem) {
      return;
    }
    // console.log(';; fetch ', hasNextPage, isFetchingNextPage, lastItem, allRows.length)

    if (
      lastItem.index >= allRows.length - 1 &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    hasNextPage,
    fetchNextPage,
    allRows.length,
    isFetchingNextPage,
    // 🚨 use get function here, memoed value won't work
    virtualizer.getVirtualItems(),
  ]);

  return (
    <div>
      <p>
        This infinite scroll example uses React Query's useInfiniteQuery hook to
        fetch infinite data from a posts endpoint and then a rowVirtualizer is
        used along with a loader-row placed at the bottom of the list to trigger
        the next page to load.
      </p>
      <br />

      {status === 'loading' ? (
        <p>Loading...</p>
      ) : status === 'error' ? (
        <span>Error: {(error as Error).message}</span>
      ) : (
        <div
          ref={scrollElemRef}
          className={listCss}
          style={{
            height: `500px`,
            width: `100%`,
            overflow: 'auto',
          }}
        >
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const isLoaderRow = virtualRow.index > allRows.length - 1;
              const post = allRows[virtualRow.index];

              return (
                <div
                  key={virtualRow.index}
                  className={
                    listItemCss +
                    ' ' +
                    (virtualRow.index % 2 ? '' : listItemEvenCss)
                  }
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualRow.size}px`,
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  {isLoaderRow
                    ? hasNextPage
                      ? 'Loading more...'
                      : 'Nothing more to load'
                    : post}
                </div>
              );
            })}
          </div>
        </div>
      )}
      <div>
        {isFetching && !isFetchingNextPage ? 'Background Updating...' : null}
      </div>
      <br />
      <br />
      {process.env.NODE_ENV === 'development' ? (
        <p>
          <strong>Notice:</strong> You are currently running React in
          development mode. Rendering performance will be slightly degraded
          until this application is build for production.
        </p>
      ) : null}
    </div>
  );
}
