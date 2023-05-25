import React, { useMemo } from 'react';

import { useSetAtom } from 'jotai';
import { useRoutes } from 'react-router-dom';

import { getAuthToken, useMeQuery } from '@datalking/pivot-store';
import { useHotkeys } from '@datalking/pivot-ui';

import { createTableFormDrawerOpened } from './features/create-table-form/drawer-opened.atom';
import { useAppSelector } from './hooks';
import { routes } from './router';

export function App() {
  const authToken = useAppSelector(getAuthToken);

  const { isFetching } = useMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
    // only fetch until authToken exists
    skip: !authToken,
  });

  // console.log(';; me ', isFetching, authToken?.slice(0, 5));

  const setOpened = useSetAtom(createTableFormDrawerOpened);
  useHotkeys([['t', () => setOpened(true)]]);

  const element = useRoutes(routes);

  // return useMemo(() => element, [element]); // not work
  return element;
}
