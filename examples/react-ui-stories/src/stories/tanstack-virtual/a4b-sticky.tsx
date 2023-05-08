import * as React from 'react';

import { findIndex, groupBy } from 'lodash';

import { faker } from '@faker-js/faker';
import { defaultRangeExtractor, useVirtualizer } from '@tanstack/react-virtual';

import { listCss, listItemCss, listItemEvenCss } from './styles';

const groupedNames = groupBy(
  Array.from({ length: 20 })
    .map(() => faker.name.firstName())
    .sort(),
  (name) => name[0],
);
const groups = Object.keys(groupedNames);
const rows = groups.reduce((acc, k) => [...acc, k, ...groupedNames[k]], []);

/**
 * sticky item implemented using `position: sticky`
 */
export const A4b1StickyItem = () => {
  const parentRef = React.useRef();

  const activeStickyIndexRef = React.useRef(0);

  const stickyIndexes = React.useMemo(
    () => groups.map((gn) => findIndex(rows, (n) => n === gn)),
    [],
  );

  const isStickyable = (index) => stickyIndexes.includes(index);
  const isActiveSticky = (index) => activeStickyIndexRef.current === index;

  const virtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 40,
    getScrollElement: () => parentRef.current,
    rangeExtractor: React.useCallback(
      (range) => {
        activeStickyIndexRef.current = [...stickyIndexes]
          .reverse()
          .find((index) => range.startIndex >= index);

        const next = new Set([
          activeStickyIndexRef.current,
          ...defaultRangeExtractor(range),
        ]);

        return [...next].sort((a, b) => a - b);
      },
      [stickyIndexes],
    ),
  });

  return (
    <div>
      <div
        ref={parentRef}
        className={listCss}
        style={{
          height: `300px`,
          width: `400px`,
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
          {virtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.index}
              className={
                listItemCss +
                ' ' +
                (virtualRow.index % 2 ? '' : listItemEvenCss)
              }
              style={{
                ...(isStickyable(virtualRow.index)
                  ? {
                      zIndex: 1,
                      background: '#fff',
                      borderBottom: '1px solid #ddd',
                    }
                  : {}),
                ...(isActiveSticky(virtualRow.index)
                  ? {
                      position: 'sticky',
                    }
                  : {
                      position: 'absolute',
                      transform: `translateY(${virtualRow.start}px)`,
                    }),
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
              }}
            >
              {rows[virtualRow.index]}
            </div>
          ))}
        </div>
      </div>
      {process.env.NODE_ENV === 'development' ? (
        <p>
          <strong>Notice:</strong> You are currently running React in
          development mode. Rendering performance will be slightly degraded
          until this application is build for production.
        </p>
      ) : null}
    </div>
  );
};
