import type { AppRouter } from '@datalking/pivot-trpc';
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';

// const BACKEND_URL = "http://localhost:4000";
const BACKEND_URL = '';

export const trpc: ReturnType<typeof createTRPCProxyClient<AppRouter>> =
  createTRPCProxyClient<AppRouter>({
    links: [
      httpBatchLink({
        url: BACKEND_URL + '/api/trpc',
        headers() {
          const token = localStorage.getItem('access_token');
          if (!token) {
            return {};
          }
          return {
            authorization: `Bearer ${token}`,
          };
        },
      }),
    ],
  });
