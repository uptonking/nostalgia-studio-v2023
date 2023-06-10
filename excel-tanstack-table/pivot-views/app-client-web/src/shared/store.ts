import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from 'react-redux';
import { load } from 'redux-localstorage-simple';

import {
  type Action,
  configureStore,
  type Middleware,
  type ThunkAction,
} from '@reduxjs/toolkit';

import { adminReducer } from '../features/admin/slice';
import { appReducer } from '../features/app/slice';
import { canvasReducer } from '../features/canvas/slice';
import { shopReducer } from '../features/shop/slice';

export const customMiddleware: Middleware = () => (next) => (action) => {
  const result = next(action);
  return result;
};

export const store = configureStore({
  reducer: {
    app: appReducer,
    canvas: canvasReducer,
    admin: adminReducer,
    shop: shopReducer,
  },
  preloadedState: load(),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      customMiddleware,
      // save({
      //   ignoreStates: ['canvas', 'shop'],
      // }),
    ]),
});
export default store;

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

/**
 * Use instead of plain `useDispatch` */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Use instead of plain `useSelector` */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
