import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { RootState } from '../reducers';
import { authApi } from '../services';

export interface AuthState {
  token?: string;
  me?: {
    userId: string;
    username: string;
    email: string;
    avatar?: string;
  };
}

const initialState: AuthState = {};

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
    },
    logout: (state) => {
      state.token = undefined;
      localStorage.removeItem('access_token');
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.me.matchRejected, (state, action) => {
        // todo remove mock
        // state.token = undefined;
        // localStorage.removeItem('access_token');
        state.me = {
          username: 'test',
          email: 'test@example.com',
          userId: 'usri0nfxc5z',
        };
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        const access_token = action.payload.access_token;
        localStorage.setItem('access_token', access_token);
        state.token = access_token;
      })
      // todo remove mock
      .addMatcher(authApi.endpoints.login.matchRejected, (state, action) => {
        const token = 'Mock_User_Auth_Token';
        localStorage.setItem('access_token', token);
        state.token = token;
      })
      .addMatcher(
        authApi.endpoints.register.matchFulfilled,
        (state, action) => {
          const access_token = action.payload.access_token;
          localStorage.setItem('access_token', access_token);
          state.token = access_token;
        },
      );
  },
});

export const { setToken, resetToken, logout } = authSlice.actions;

export const authReducer = authSlice.reducer;

/** check if auth token exists */
export const getIsAuthorized = (state: RootState) => Boolean(state.auth.token);

export const getIsMockingOfflineLogin = (state: RootState) =>
  state.auth.token === 'Mock_User_Auth_Token';

export const getAuthedMe = (state: RootState) => state.auth.me;
