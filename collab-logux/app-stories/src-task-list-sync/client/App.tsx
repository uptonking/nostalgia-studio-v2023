import './styles/theme.css';
import './styles/base.css';

import React from 'react';

import { ClientContext, ErrorsContext } from '@logux/client/react';
import { useStore } from '@nanostores/react';

import { Layout } from './components/Layout/Layout';
import { Routes } from './components/Routes/Routes';
import { AccessDeniedPage } from './pages/AccessDeniedPage';
import { ErrorPage } from './pages/ErrorPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { clientStore } from './stores/logux-client';

const errorPages = {
  NotFound: NotFoundPage,
  AccessDenied: AccessDeniedPage,
  Error: ErrorPage,
};

export const App = (): JSX.Element => {
  let client = useStore(clientStore);

  return (
    <ErrorsContext.Provider value={errorPages}>
      <ClientContext.Provider value={client}>
        <Layout>
          <Routes />
        </Layout>
      </ClientContext.Provider>
    </ErrorsContext.Provider>
  );
};
