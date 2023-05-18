import { persistReducer } from 'redux-persist';
import storage from 'redux-persist/es/storage';

import { combineReducers } from '@reduxjs/toolkit';

import { api, attachment, authApi, userApi } from '../services';
import { tableReducer, tableSlice } from '../slices';
import { authReducer, authSlice } from '../slices/auth';
import { recordReducer, recordSlice } from '../slices/record';

export const combinedReducers = combineReducers({
  [tableSlice.name]: tableReducer,
  [recordSlice.name]: recordReducer,
  [authSlice.name]: authReducer,
  [api.reducerPath]: api.reducer,
  [userApi.reducerPath]: userApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  // [attachment.reducerPath]: attachment.reducer,
});

export const rootReducer = persistReducer(
  {
    key: 'root',
    version: 1,
    storage, // defaults to localStorage for web
    blacklist: [api.reducerPath, recordSlice.name, userApi.reducerPath],
  },
  combinedReducers,
);

export type RootState = ReturnType<typeof combinedReducers>;
