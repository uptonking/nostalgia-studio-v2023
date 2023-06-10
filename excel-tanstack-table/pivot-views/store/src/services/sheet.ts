import { type IQueryTable } from '@datalking/pivot-core';
import {
  type ICreateTableInput,
  type ICreateTableOutput,
  type IGetTableOutput,
  type IGetTableQuery,
  type IGetTablesOutput,
  type IGetTablesQuery,
} from '@datalking/pivot-cqrs';
import { type EntityState } from '@reduxjs/toolkit';
import { createEntityAdapter } from '@reduxjs/toolkit';

import { mainApi } from './api';

const tableAdapter = createEntityAdapter<IQueryTable>();
const initialState = tableAdapter.getInitialState();

type QueryTableEntityState = EntityState<IQueryTable>;

const providesTags = (result: QueryTableEntityState | undefined) => [
  'Table' as const,
  ...(result?.ids?.map((id) => ({ type: 'Table' as const, id })) ?? []),
];

export const sheetApi = mainApi.injectEndpoints({
  endpoints: (builder) => ({
    getTables: builder.query<QueryTableEntityState, IGetTablesQuery>({
      // query: ({ id }) => ({ url: '/table.list' + '?batch=1&input=%7B%220%22%3A%7B%7D%7D' }),
      // query: ({ id }) => ({ url: '/table.list' + '?input=%7B%220%22%3A%7B%7D%7D' }),
      query: ({ id }) => ({ url: '/table.list', params: { input: null } }),
      providesTags,
      transformResponse: (result: IQueryTable[]) => {
        // console.log(';; result-table-list ', result);
        return tableAdapter.setAll(initialState, result);
      },
    }),
    // getTable: builder.query<IGetTableOutput, IGetTableQuery>({
    //   query: trpc.table.get.query,
    //   providesTags: (_, __, args) => [{ type: 'Table', id: args.id }],
    // }),
    // createTable: builder.mutation<ICreateTableOutput, ICreateTableInput>({
    //   query: trpc.table.create.mutate,
    //   invalidatesTags: ['Table'],
    // }),
    // updateTable: builder.mutation({
    //   query: trpc.table.update.mutate,
    //   invalidatesTags: ['Table'],
    // }),
    // deleteTable: builder.mutation({
    //   query: trpc.table.delete.mutate,
    //   invalidatesTags: ['Table'],
    // }),
  }),
  overrideExisting: true,
});

export const {
  useGetTablesQuery,
  // useGetTableQuery,
  // useLazyGetTableQuery,
  // useCreateTableMutation,
  // useUpdateTableMutation,
  // useDeleteTableMutation,
} = sheetApi;
