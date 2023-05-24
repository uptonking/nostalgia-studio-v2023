import { persistStore } from 'redux-persist';

import { configureStore } from '@reduxjs/toolkit';

import { rootReducer } from '../reducers';
import { attachment, authApi, userApi } from '../services';
import { api, mainApi } from '../services/api';

export const createStore = () => {
  const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false })
        .concat(mainApi.middleware)
        .concat(api.middleware)
        // .concat(attachment.middleware)
        .concat(authApi.middleware)
        .concat(userApi.middleware),
    devTools: process.env.NODE_ENV !== 'production',
  });

  const persist = persistStore(store);

  return { store, persist };
};

export type AppStore = ReturnType<typeof createStore>['store'];

export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export { PersistGate } from 'redux-persist/integration/react';
