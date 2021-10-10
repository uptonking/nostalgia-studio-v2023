import type { RoutesConfigType } from './../../../config/routes-test';
import routesAtlaskitConfig from '../../../config/routes-miniapp-atlaskit';
import * as actionsToHandle from './constants';
import type { ReactNode } from 'react';

export type MiniAppStateType = {
  /** 当前展示的资料小程序名称 */
  miniAppOwner?: string;
  miniAppName?: string;
  miniAppId?: string;
  /** 当前展示的资料小程序的路由配置 */
  miniAppRoutesConfig?: RoutesConfigType;
  miniAppDefaultRoot?: string;
  pagesContentsCaches?: Record<string, string>;
  openingPagePath?: string;
  // miniAppIndexComp?: ReactNode;
};

export function getMiniAppInitialState(): MiniAppStateType {
  return {
    miniAppName: 'ak',
    miniAppRoutesConfig: routesAtlaskitConfig as any,
    pagesContentsCaches: {},
  };
}

export function miniAppReducer(
  state = getMiniAppInitialState(),
  action,
): MiniAppStateType {
  for (const actionName in actionsToHandle) {
    if (actionsToHandle[actionName] === action.type) {
      console.log(';;action-ing-mini-app, ', action.type);
      return {
        ...state,
        ...action.payload,
      };
    }
  }

  // console.log(';;返回旧的 repoState ');

  return state;
}

export default miniAppReducer;
