import type { ClientSettings } from '@datalking/pivot-app-shared-lib';
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { type AppUser, getPersistedAuthFromStorage } from '../../shared/auth';
import { type ThemeState } from '../ui/Theme/getTheme';
import { type AppNotification, NotificationSeverity } from './types';

export interface AppState {
  user?: AppUser;
  token?: string;
  darkMode: boolean;
  ui?: ThemeState;
  notifications: AppNotification[];
  drawerLeftOpen?: boolean;
  drawerRightOpen?: boolean;
  loading?: boolean;
  loaded?: boolean;
  dialog?: string;
  settings?: ClientSettings;
  deviceId?: string;
  ready: boolean;
  locale: string;
}

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
// console.log(';; prefersDark ', prefersDark);

const defaultState: AppState = {
  darkMode: Boolean(prefersDark),
  notifications: [],
  ready: false,
  locale: 'en',
};

const persistedAuth = getPersistedAuthFromStorage();
const initialState = {
  ...defaultState,
  token: persistedAuth?.token,
  user: persistedAuth?.user,
};

const slice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    patch: (state, action: PayloadAction<Partial<AppState>>) => {
      return { ...state, ...action.payload };
    },
    notify: (state, action: PayloadAction<string>) => {
      state.notifications.push({
        message: action.payload,
        id: new Date().getTime().toString(),
        severity: NotificationSeverity.info,
      });
    },
    notifyError: (state, action: PayloadAction<string>) => {
      state.notifications.push({
        message: action.payload,
        id: new Date().getTime().toString(),
        severity: NotificationSeverity.error,
      });
    },
  },
});

export const { patch, notify, notifyError } = slice.actions;

export const appReducer = slice.reducer;
export default appReducer;
