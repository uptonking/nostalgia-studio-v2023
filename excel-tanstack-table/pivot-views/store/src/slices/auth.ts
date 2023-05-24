import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../reducers';
import { authApi } from '../services';

export interface AuthState {
  token?: string;
  authStatus?: 'pending' | 'success' | 'failure' | 'idle';
  me?: {
    userId: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

const initialState: AuthState = { authStatus: 'idle' };

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem('access_token', action.payload);
    },
    resetToken: (state) => {
      state.token = undefined;
      localStorage.removeItem('access_token');
      state.authStatus = 'idle';
    },
    logout: (state) => {
      state.token = undefined;
      localStorage.removeItem('access_token');
      state.authStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.me.matchPending, (state, action) => {
        state.authStatus = 'pending';
      })
      .addMatcher(authApi.endpoints.me.matchFulfilled, (state, action) => {
        state.authStatus = 'success';
      })
      .addMatcher(authApi.endpoints.me.matchRejected, (state, action) => {
        state.token = undefined;
        state.authStatus = 'failure';
        localStorage.removeItem('access_token');
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        const access_token = action.payload.access_token;
        localStorage.setItem('access_token', access_token);
        state.token = access_token;
        // state.authStatus = 'success';
      })
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, action) => {
          const access_token = action.payload.access_token;
          localStorage.setItem('access_token', access_token);
          state.token = access_token;
          // state.authStatus = 'success';
        },
      );
  },
});

export const { setToken, resetToken, logout } = authSlice.actions;

export const authReducer = authSlice.reducer;

export const getIsAuthorized = (state: RootState) =>
  state.auth.token && state.auth.authStatus === 'success';

export const getAuthStatus = (state: RootState) => state.auth.authStatus;
export const getAuthToken = (state: RootState) => state.auth.token;
