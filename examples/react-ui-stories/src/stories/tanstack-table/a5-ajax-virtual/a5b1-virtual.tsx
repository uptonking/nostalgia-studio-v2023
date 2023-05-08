import React from 'react';

import { css } from '@linaria/core';
import type { ColumnDef } from '@tanstack/react-table';

import { FixedHeightTable } from '../components/fixed-height-table';
import { WindowHeightTable } from '../components/window-height-table';
import { tableBaseCss } from '../examples.styles';
import { makeData, Person, tableColumns } from '../utils/makeData';

const MOCK_DATA_LEN = 20;

/**
 * ✨ 每行元素固定高度，overscan为N时会在上下方都出现N个元素
 */
export function A5b1VirtualTable() {
  const rerender = React.useReducer(() => ({}), {})[1];

  const columns = React.useMemo<ColumnDef<Person>[]>(() => tableColumns, []);

  const [data, setData] = React.useState(() => makeData(MOCK_DATA_LEN));
  const refreshData = () => setData(() => makeData(MOCK_DATA_LEN));

  const [tableType, setTableType] = React.useState<'fixed' | 'window'>('fixed');

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
          <p>
            <select
              name='table_type'
              // @ts-expect-error fix-types
              onChange={(event) => setTableType(event.target.value)}
              value={tableType}
            >
              <option value='fixed'>Fixed Height</option>
              <option value='window'>Window Height</option>
            </select>
          </p>
        </div>
        <div className='h-2' />
        {tableType === 'fixed' ? (
          <FixedHeightTable data={data} columns={columns} height={240} />
        ) : (
          <WindowHeightTable data={data} columns={columns} />
        )}
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

export const rootCss = css`
  .sticky-header {
    position: sticky;
    top: 0;
    background-color: beige;
  }
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
