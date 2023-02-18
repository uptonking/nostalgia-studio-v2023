import React from 'react';

import styled from '@emotion/styled';
import type { ColumnDef } from '@tanstack/react-table';

import { StyledRTableCore } from '../editor-examples.styles';
import { makeData, Person, tableColumns } from '../utils/makeData';
import { FixedHeightTable } from './components/fixed-heght-table';
import { WindowHeightTable } from './components/window-height-table';

export const StyledContainer = styled(StyledRTableCore)`
  & .sticky-header {
    position: sticky;
    top: 0;
  }
  & .fixed-header {
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

/**
 * ✨ 示例，仅展示
 */
export function A1d1VirtualTable() {
  const rerender = React.useReducer(() => ({}), {})[1];

  const columns = React.useMemo<ColumnDef<Person>[]>(() => tableColumns, []);

  const [data, setData] = React.useState(() => makeData(50_000));
  const refreshData = () => setData(() => makeData(50_000));

  const [tableType, setTableType] = React.useState<'fixed' | 'window'>('fixed');

  return (
    <StyledContainer>
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
          <FixedHeightTable data={data} columns={columns} height={500} />
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
    </StyledContainer>
  );
}
