import {
  AuthStateType,
  authReducer,
  getAuthInitialState,
} from './auth/reducers';
import {
  SettingsStateType,
  getSettingsInitialState,
  settingsReducer,
} from './settings/reducers';
import {
  UserStateType,
  getUserInitialState,
  userReducer,
} from './user/reducers';

export type GlobalStateType = {
  settings?: SettingsStateType;
  auth?: AuthStateType;
  user?: UserStateType;
};

export type { GlobalContextType, GlobalProviderProps } from './global-context';

export const globalInitialState: GlobalStateType = {
  settings: getSettingsInitialState(),
  auth: getAuthInitialState(),
  user: getUserInitialState(),
};

export function combiningReducer(
  state: GlobalStateType,
  action: any,
): GlobalStateType {
  return {
    settings: settingsReducer(state.settings, action),
    auth: authReducer(state.auth, action),
    user: userReducer(state.user, action),
  };
}
