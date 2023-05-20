import { trpc } from '../trpc';
import { api } from './api';

const fieldApi = api.injectEndpoints({
  endpoints: (builder) => ({
    createField: builder.mutation({
      query: trpc.table.field.create.mutate,
      invalidatesTags: (_, __, args) => [
        // @ts-expect-error fix-types
        { type: 'Table', id: args.tableId },
        'Record',
        'TreeRecord',
      ],
    }),
    updateField: builder.mutation({
      query: trpc.table.field.update.mutate,
      invalidatesTags: (_, __, args) => [
        // @ts-expect-error fix-types
        { type: 'Table', id: args.tableId },
        'Record',
        'TreeRecord',
      ],
    }),
    deleteField: builder.mutation({
      query: trpc.table.field.delete.mutate,
      // @ts-expect-error fix-types
      invalidatesTags: (_, __, args) => [{ type: 'Table', id: args.tableId }],
    }),
  }),
});

export const {
  useCreateFieldMutation,
  useDeleteFieldMutation,
  useUpdateFieldMutation,
} = fieldApi;

const selectApi = fieldApi.injectEndpoints({
  endpoints: (builder) => ({
    createOption: builder.mutation({
      query: trpc.table.field.select.createOption.mutate,
      // @ts-expect-error fix-types
      invalidatesTags: (_, __, args) => [{ type: 'Table', id: args.tableId }],
    }),
    updateOption: builder.mutation({
      query: trpc.table.field.select.updateOption.mutate,
      // @ts-expect-error fix-types
      invalidatesTags: (_, __, args) => [{ type: 'Table', id: args.tableId }],
    }),
    deleteOption: builder.mutation({
      query: trpc.table.field.select.deleteOption.mutate,
      // @ts-expect-error fix-types
      invalidatesTags: (_, __, args) => [{ type: 'Table', id: args.tableId }],
    }),
    reorderOptions: builder.mutation({
      query: trpc.table.field.select.reorderOptions.mutate,
      // @ts-expect-error fix-types
      invalidatesTags: (_, __, args) => [{ type: 'Table', id: args.tableId }],
    }),
  }),
});

export const {
  useCreateOptionMutation,
  useUpdateOptionMutation,
  useDeleteOptionMutation,
  useReorderOptionsMutation,
} = selectApi;
