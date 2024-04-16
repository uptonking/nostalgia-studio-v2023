import React from 'react';

import { useVirtualizer } from '@tanstack/react-virtual';

import { listCss, listItemCss, listItemEvenCss } from './styles';

export const A1b1VirtualFixedSize = () => {
  return (
    <div>
      <p>
        These components are using <strong>fixed</strong> sizes. This means that
        every element's dimensions are hard-coded to the same value and never
        change.
      </p>
      <br />
      <br />

      <h3>Rows</h3>
      <RowVirtualizerFixed />
      <br />
      <br />
      <h3>Columns</h3>
      <ColumnVirtualizerFixed />
      <br />
      <br />
      <h3>Grid</h3>
      <GridVirtualizerFixed />
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
};

function RowVirtualizerFixed() {
  const scrollElemRef = React.useRef();

  const virtualizer = useVirtualizer({
    count: 10000,
    getScrollElement: () => scrollElemRef.current,
    estimateSize: () => 40,
    overscan: 2,
  });

  const items = virtualizer.getVirtualItems();

  return (
    <div
      ref={scrollElemRef}
      className={listCss}
      style={{
        height: '200px',
        width: '400px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          height: virtualizer.getTotalSize() + 'px',
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Only the visible items in the virtualizer, manually positioned to be in view */}
        {items.map((virtualRow) => (
          <div
            key={virtualRow.index}
            className={
              listItemCss + ' ' + (virtualRow.index % 2 ? '' : listItemEvenCss)
            }
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            Row {virtualRow.index}
          </div>
        ))}
      </div>
    </div>
  );
}

function ColumnVirtualizerFixed() {
  const parentRef = React.useRef();

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: 10000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className={listCss}
      style={{
        width: `400px`,
        height: `100px`,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          width: `${columnVirtualizer.getTotalSize()}px`,
          height: '100%',
          position: 'relative',
        }}
      >
        {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
          <div
            key={virtualColumn.index}
            className={
              listItemCss +
              ' ' +
              (virtualColumn.index % 2 ? '' : listItemEvenCss)
            }
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${virtualColumn.size}px`,
              transform: `translateX(${virtualColumn.start}px)`,
            }}
          >
            Column {virtualColumn.index}
          </div>
        ))}
      </div>
    </div>
  );
}

function GridVirtualizerFixed() {
  const parentRef = React.useRef();

  const rowVirtualizer = useVirtualizer({
    count: 10000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
    overscan: 5,
  });

  const columnVirtualizer = useVirtualizer({
    horizontal: true,
    count: 10000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className={listCss}
      style={{
        height: `500px`,
        width: `500px`,
        overflow: 'auto',
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: `${columnVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <React.Fragment key={virtualRow.index}>
            {columnVirtualizer.getVirtualItems().map((virtualColumn) => (
              <div
                key={virtualColumn.index}
                className={
                  listItemCss +
                  ' ' +
                  (virtualColumn.index % 2
                    ? virtualRow.index % 2 === 0
                      ? ''
                      : listItemEvenCss
                    : virtualRow.index % 2
                      ? ''
                      : listItemEvenCss)
                }
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: `${virtualColumn.size}px`,
                  height: `${virtualRow.size}px`,
                  transform: `translateX(${virtualColumn.start}px) translateY(${virtualRow.start}px)`,
                }}
              >
                Cell {virtualRow.index}, {virtualColumn.index}
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
