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
import {
  RepoStateType,
  getRepoInitialState,
  repoReducer,
} from './repo/reducers';
import {
  MiniAppStateType,
  getMiniAppInitialState,
  miniAppReducer,
} from './mini-app/reducers';

import * as commonActions from './actions-constants';
import * as repoActions from './repo/constants';
import * as miniAppActions from './mini-app/constants';

export type GlobalStateType = {
  settings?: SettingsStateType;
  auth?: AuthStateType;
  user?: UserStateType;
  repo?: RepoStateType;
  miniApp?: MiniAppStateType;
};

export type ActionType = {
  type:
    | keyof typeof commonActions
    | keyof typeof repoActions
    | keyof typeof miniAppActions;

  [name: string]: any;
};

export type { GlobalContextType, GlobalProviderProps } from './global-context';

export const globalInitialState: GlobalStateType = {
  settings: getSettingsInitialState(),
  auth: getAuthInitialState(),
  user: getUserInitialState(),
  repo: getRepoInitialState(),
  miniApp: getMiniAppInitialState(),
};

export function combiningReducer(
  state: GlobalStateType,
  action: ActionType,
): GlobalStateType {
  return {
    settings: settingsReducer(state.settings, action),
    auth: authReducer(state.auth, action),
    user: userReducer(state.user, action),
    repo: repoReducer(state.repo, action),
    miniApp: miniAppReducer(state.miniApp, action),
  };
}
