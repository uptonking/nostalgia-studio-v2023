import React, { useEffect, useReducer } from 'react';

import { css } from '@linaria/core';

import { reducer } from './store';
import { Table } from './table';
import { ACTION_TYPES, makeData } from './utils';

export function B1b1PivotTableApp() {
  const [state, dispatch] = useReducer(reducer, makeData(30));

  // useEffect(() => {
  //   dispatch({ type: ACTION_TYPES.Enable_reset });
  // }, [state.data, state.columns]);

  return (
    <div className={appCss}>
      {/* <h1>PivotTable using tanstack-table</h1> */}
      <Table
        columns={state.columns}
        data={state.data}
        dispatch={dispatch}
        skipReset={state.skipReset}
      />
    </div>
  );
}

const appCss = css`
  overflow: hidden;
  width: 100%;
  padding: 10px;
  font-family:
    Inter,
    Roboto,
    -apple-system,
    BlinkMacSystemFont,
    'avenir next',
    avenir,
    'segoe ui',
    'helvetica neue',
    helvetica,
    Ubuntu,
    noto,
    arial,
    sans-serif;
`;
