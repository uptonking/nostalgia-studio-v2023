import React from 'react';

import { useSetAtom } from 'jotai';
import { useRoutes } from 'react-router-dom';

import {
  getAuthStatus,
  getAuthToken,
  getIsAuthorized,
  useMeQuery,
} from '@datalking/pivot-store';
import { useHotkeys } from '@datalking/pivot-ui';

import {
  createTableFormDrawerOpened,
} from './features/create-table-form/drawer-opened.atom';
import { useAppSelector } from './hooks';
import { routes } from './router';

export function App() {
  // const isAuthorized = useSelector(getIsAuthorized);
  const authStatus = useAppSelector(getAuthStatus);
  const authToken = useAppSelector(getAuthToken);

  const { isFetching } = useMeQuery(
    authToken,
    {
      refetchOnMountOrArgChange: true,
      skip: authToken && authStatus === 'success',
      // skip: authStatus==='idle',
      // skip: false,
    },
  );

  console.log(';; me ', isFetching, authStatus, authToken?.slice(0, 5));

  const setOpened = useSetAtom(createTableFormDrawerOpened);

  useHotkeys([['t', () => setOpened(true)]]);

  const element = useRoutes(routes);

  return element;
}
