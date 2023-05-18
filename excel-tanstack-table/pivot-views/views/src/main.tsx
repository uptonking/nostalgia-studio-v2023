import React from 'react';

import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';

import { createStore, PersistGate } from '@datalking/pivot-store';
import { Notifications, UIProvider } from '@datalking/pivot-ui';

import { App } from './App';
import { I18n } from './i18n/i18n';
import { configureFakeBackend } from './utils/fake-backend';

const { store, persist } = createStore();

// configureFakeBackend();

const AppRoot = () => {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persist}>
        <I18n>
          <UIProvider
            theme={{ primaryColor: 'teal',
            defaultGradient: { from: 'blue', to: 'teal', deg: 20 }
          }}
            withGlobalStyles
            withNormalizeCSS
          >
            <Notifications />
            <BrowserRouter>
              <QueryParamProvider adapter={ReactRouter6Adapter}>
                <App />
              </QueryParamProvider>
            </BrowserRouter>
          </UIProvider>
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
