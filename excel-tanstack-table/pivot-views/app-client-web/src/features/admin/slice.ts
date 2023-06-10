import { type PagedResult } from '@datalking/pivot-app-shared-lib';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface AdminState {
  activeMenuItem?: string;
  menuOpen?: boolean;
  loading?: boolean;
  loaded?: boolean;
  data: {
    [key: string]: PagedResult;
  };
}

const initialState: AdminState = {
  menuOpen: true,
  data: {},
};

const slice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    patch: (state, action: PayloadAction<Partial<AdminState>>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { patch } = slice.actions;

export const actions = slice.actions;

export const adminReducer = slice.reducer;
export default adminReducer;
