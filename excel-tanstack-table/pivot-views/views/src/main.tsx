import React from 'react';

import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

import { createStore, PersistGate } from '@datalking/pivot-store';
import { EgoUIProvider, Notifications } from '@datalking/pivot-ui';

import { App } from './App';
import { I18n } from './i18n/i18n';

const { store, persist } = createStore();

const AppRoot = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persist}>
        <I18n>
          <EgoUIProvider
            theme={{ primaryColor: 'indigo' }}
            withGlobalStyles
            withNormalizeCSS
          >
            <Notifications />
            <BrowserRouter>
              <QueryParamProvider adapter={ReactRouter6Adapter}>
                <App />
              </QueryParamProvider>
            </BrowserRouter>
          </EgoUIProvider>
        </I18n>
      </PersistGate>
    </Provider>
  );
};

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppRoot />
  </React.StrictMode>,
);
