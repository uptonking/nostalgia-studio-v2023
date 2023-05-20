import { createApi } from '@reduxjs/toolkit/query/react';

/** using `createApi` from rtk-query */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: (trpcResult: Promise<unknown>) =>
    trpcResult.then((data) => ({ data })).catch((error: any) => ({ error })),
  endpoints: () => ({}),
  tagTypes: ['Table', 'Record', 'TreeRecord'],
});
