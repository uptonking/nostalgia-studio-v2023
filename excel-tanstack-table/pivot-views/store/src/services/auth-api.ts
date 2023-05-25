import type { IQueryUser } from '@datalking/pivot-core';
import { createSelector } from '@reduxjs/toolkit';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

import type { RootState } from '../store/reducer';
import { fetchBase } from './api';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBase({ prefix: '/api/auth' }) as any,
  endpoints: (builder) => ({
    me: builder.query<{ me: IQueryUser }, void>({
      query: (args) => ({ url: '/me' }),
    }),
    register: builder.mutation<
      { access_token: string },
      { email: string; password: string }
    >({
      query: (data) => ({
        url: '/register',
        method: 'POST',
        data,
        params: { noAuthToken: true },
      }),
    }),
    login: builder.mutation<
      { access_token: string },
      { email: string; password: string }
    >({
      query: (data) => ({
        url: '/login',
        method: 'POST',
        data,
        params: { noAuthToken: true },
      }),
    }),
  }),
});

const authApiBak = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/auth',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
    },
  }),
  endpoints: (builder) => ({
    me: builder.query<{ me: IQueryUser }, void>({
      query: () => 'me',
    }),
    register: builder.mutation<
      { access_token: string },
      { email: string; password: string }
    >({
      query: (data) => ({
        url: 'register',
        method: 'POST',
        body: data,
      }),
    }),
    login: builder.mutation<
      { access_token: string },
      { email: string; password: string }
    >({
      query: (data) => ({
        url: 'login',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useLoginMutation, useMeQuery, useRegisterMutation } = authApi;

const selectMe = authApi.endpoints.me.select(undefined);

export const getMe = createSelector(selectMe, (me) => me.data?.me);
// export const getMe = createSelector(selectMe, (me) => me);
export const getMeData = (state: RootState) =>
  authApi.endpoints.me.select()(state);
