import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const api = createApi({
  reducerPath: 'api',
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

export const mainApi = createApi({
  reducerPath: 'mainApi',
  baseQuery: fetchBase() as any,
  endpoints: () => ({}),
  tagTypes: ['Table', 'Record', 'TreeRecord'],
});

type FetchBaseArgsType = { prefix?: string };

/**
 * custom base query
 * - https://redux-toolkit.js.org/rtk-query/usage/customizing-queries
 */
export function fetchBase(fetchArgs: FetchBaseArgsType = {}) {
  return async ({ url, method, data, params }) => {
    const prefix = fetchArgs?.prefix ?? '/api/trpc';
    let uri = prefix + (url.startsWith('/') ? '' : '/') + url;
    if (params?.input === null) uri += '?input={}';
    method = method || 'GET';
    console.log(';; fetchArgs ', prefix, uri, data, params);

    const fetchOptions: RequestInit = {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
      },
    };

    const authToken = localStorage.getItem('access_token');
    if (authToken && (params === undefined || !params['noAuthToken'])) {
      fetchOptions.headers['Authorization'] = 'Bearer ' + authToken;
    }

    if (typeof data === 'object') {
      fetchOptions.body = JSON.stringify(data);
      fetchOptions.headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(uri, fetchOptions);
      const resJson = await res.json();
      console.log(';; fetchBase-res ', url, resJson);

      if (
        String(resJson['statusCode']).startsWith('40') ||
        String(resJson['statusCode']).startsWith('50')
      ) {
        return {
          error: {
            status: resJson['statusCode'],
            data: resJson['message'],
          },
        };
      }

      if (prefix === '/api/trpc') {
        return { data: resJson['result']['data'] };
      }
      return { data: resJson };
    } catch (err) {
      console.log(';; fetchBase-err ', url, err);
      return {
        error: {
          status: err?.response?.status,
          data: err?.response?.data || err.message,
        },
      };
    }
  };
}
