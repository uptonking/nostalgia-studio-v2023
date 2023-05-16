import React from 'react';

import axios from 'axios';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

import { config } from '../../shared/config';
import { store } from '../../shared/store';
import { MainLayout } from '../ui/MainLayout';
import ThemeSwitch from '../ui/Theme';
import ConfigProvider from './ConfigProvider';
import LanguageProvider from './LanguageProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, cacheTime: 3000, staleTime: 3000 },
  },
});

axios.defaults.baseURL = config.backendUrl;

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <HelmetProvider>
          <BrowserRouter basename={config.baseName}>
            <ThemeSwitch>
              <ConfigProvider>
                <LanguageProvider>
                  <MainLayout />
                </LanguageProvider>
              </ConfigProvider>
            </ThemeSwitch>
          </BrowserRouter>
        </HelmetProvider>
      </Provider>
    </QueryClientProvider>
  );
}
