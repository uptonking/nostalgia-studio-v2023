import type { IQueryUser } from '@datalking/pivot-core';
import type { IGetUsersOutput, IGetUsersQuery } from '@datalking/pivot-cqrs';
import type { EntityState } from '@reduxjs/toolkit';
import { createEntityAdapter } from '@reduxjs/toolkit';
import { createApi } from '@reduxjs/toolkit/query/react';

import { trpc } from '../trpc';

const userAdapter = createEntityAdapter<IQueryUser>({
  selectId: (u) => u.userId,
});
const initialState = userAdapter.getInitialState();

type QueryUserEntityState = EntityState<IQueryUser>;

export const userApi = createApi({
  reducerPath: 'user-api',
  baseQuery: (result: Promise<unknown>) =>
    result.then((data) => ({ data })).catch((error: any) => ({ error })),
  endpoints: (builder) => ({
    getUsers: builder.query<QueryUserEntityState, IGetUsersQuery>({
      query: trpc.user.users.query,
      transformResponse: (result: IGetUsersOutput) =>
        userAdapter.setAll(initialState, result.users),
    }),
  }),
});

export const { useGetUsersQuery } = userApi;
