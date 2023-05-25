import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import { tableApi } from '../services';
import type { RootState } from '../store/reducer';

export interface ApiMockDataState {
  config: { online: boolean };
  queries: any;
  mutations: any;
}

const initialState: ApiMockDataState = {
  config: { online: true },
  queries: {},
  mutations: {},
};

export const apiMockDataSlice = createSlice({
  name: 'apiMockData',
  initialState,
  reducers: {
    // setCurrentTableId: (state, action: PayloadAction<string>) => {
    //   state.currentTableId = action.payload;
    // },
  },
  extraReducers(builder) {
    builder;
    // .addMatcher(tableApi.endpoints.getTables.matchRejected, (state, action) => {
    // todo remove mock
    // state.token = undefined;
    // localStorage.removeItem('access_token');
    // state.me = {
    //   username: 'test',
    //   email: 'test@example.com',
    // };
    // });
  },
});

// export const {
//   setCurrentTableId,
//   resetCurrentTableId,
//   setCurrentViewId,
//   resetCurrentViewId,
// } = apiMockDataSlice.actions;

export const tableReducer = apiMockDataSlice.reducer;

const self = (state: RootState) => state;

export const getCurrentTableId = createSelector(
  self,
  (state) => state.table.currentTableId,
);
export const getCurrentViewId = createSelector(
  self,
  (state) => state.table.currentViewId,
);

export const getTotalCount = createSelector(
  self,
  (state) => state.table.totalCount,
);
