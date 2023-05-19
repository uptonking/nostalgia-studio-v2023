import React from 'react';

import { useSetAtom } from 'jotai';
import { useSelector } from 'react-redux';
import { useRoutes } from 'react-router-dom';

import { getIsAuthorized, useMeQuery } from '@datalking/pivot-store';
import { useHotkeys } from '@datalking/pivot-ui';

import { createTableFormDrawerOpened } from './features/create-table-form/drawer-opened.atom';
import { routes } from './router';

export function App() {
  const isAuthorized = useSelector(getIsAuthorized);

  useMeQuery(undefined, {
    refetchOnMountOrArgChange: true,
    skip: !isAuthorized,
  });

  const setOpened = useSetAtom(createTableFormDrawerOpened);

  useHotkeys([['t', () => setOpened(true)]]);

  const element = useRoutes(routes);

  return element;
}

export default App;
