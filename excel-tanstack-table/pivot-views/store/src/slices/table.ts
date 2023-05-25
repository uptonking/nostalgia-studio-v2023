import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import { sheetApi, tableApi } from '../services';
import type { RootState } from '../store/reducer';

export interface TableState {
  currentTableId: string;
  currentViewId?: string;
  totalCount: number;
}

const initialState: TableState = {
  currentTableId: '',
  totalCount: 0,
};

export const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setCurrentTableId: (state, action: PayloadAction<string>) => {
      state.currentTableId = action.payload;
    },
    resetCurrentTableId: (state) => {
      state.currentTableId = '';
    },
    setCurrentViewId: (state, action: PayloadAction<string | undefined>) => {
      state.currentViewId = action.payload;
    },
    resetCurrentViewId: (state) => {
      state.currentViewId = undefined;
    },
  },
  extraReducers(builder) {
    builder.addMatcher(
      sheetApi.endpoints.getTables.matchFulfilled,
      (state, action) => {
        state.totalCount = action.payload?.ids.length ?? 0;
      },
    );
  },
});

export const {
  setCurrentTableId,
  resetCurrentTableId,
  setCurrentViewId,
  resetCurrentViewId,
} = tableSlice.actions;

export const tableReducer = tableSlice.reducer;

const rootState = (state: RootState) => state;

export const getCurrentTableId = createSelector(
  rootState,
  (state) => state.table.currentTableId,
);
export const getCurrentViewId = createSelector(
  rootState,
  (state) => state.table.currentViewId,
);

export const getTotalCount = createSelector(
  rootState,
  (state) => state.table.totalCount,
);
