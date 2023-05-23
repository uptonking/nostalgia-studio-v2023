import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
  // baseQuery: (result: Promise<unknown>) =>
  // result.then((data) => ({ data })).catch((error: TRPCError) => ({ error })),
  baseQuery: async (result: Promise<unknown>) => {
    // console.log(';; baseQuery ', result);
    try {
      const data = await result;
      return { data };
    } catch (error) {
      return { error };
    }
  },
  endpoints: () => ({}),
  tagTypes: ['Table', 'Record', 'TreeRecord'],
});

export const modelApi = createApi({
  reducerPath: 'sheetApi',
  baseQuery: fetchBase() as any,
  endpoints: () => ({}),
  tagTypes: ['Table', 'Record', 'TreeRecord'],
});

type FetchBaseArgsType = { prefix?: string };

export function fetchBase(fetchArgs: FetchBaseArgsType = {}) {
  return async ({ url, method, data, params }) => {
    const prefixUrl = fetchArgs?.prefix ?? '/api/trpc';
    url = prefixUrl + url;
    method = method || 'GET';

    try {
      const res = await fetch(url, {
        method,
        credentials: 'include',
        headers: {
          Authorization: 'Bearer ' + localStorage.getItem('access_token'),
        },
      });
      const resJson = await res.json();
      // console.log(';; fetchBase ', url, resJson);
      return { data: resJson['result']['data'] };
    } catch (err) {
      return {
        error: {
          status: err.response?.status,
          data: err.response?.data || err.message,
        },
      };
    }
  };
}
