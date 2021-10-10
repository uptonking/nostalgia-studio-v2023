import defaultSettings from '../../../config/defaultSettings';
import type {
  ContentScrollPosType,
  I18nDirType,
  SidebarType,
  ThemeType,
} from '../../common/types/ui-layout';
import {
  DIRECTION,
  HEADER_POSITION,
  LAYOUT,
  LOGO_BG,
  NAVBAR_BG,
  RESET_TO_DEFAULT_LAYOUT,
  SIDEBAR_BG,
  SIDEBAR_POSITION,
  SIDEBAR_TYPE,
  SIDEBAR_VISIBLE_MODE,
  SIDE_PANEL_POSITION,
  SIDE_PANEL_TYPE,
  THEME,
  TOGGLE_SETTINGS_COG_BUTTON,
  TOGGLE_SIDE_PANEL,
} from '../actions-constants';

export type SettingsStateType = {
  logoText?: string;
  isSettingsCogButtonShown?: boolean;
  /** auto用作默认初始值，visible是为了添加.show-sidebar样式类到左侧边栏；
   * 其他值主要是为了处理一种特殊情况，当full变成mini时会一直保持mini；
   * 当宽度达到小屏幕时，只会在auto、visible间切换，这里的操作是一致的，没有特殊情况；
   */
  sidebarVisibleMode: 'visible' | 'hidden' | 'auto' | 'full2mini' | 'mini2full';
  activeSidebarType?: SidebarType;
  activeSidebarPos?: ContentScrollPosType;
  activeSidePanelType?: 'overlay' | 'dock';
  activeSidePanelPos?: ContentScrollPosType;
  isSidePanelShown: boolean;
  activeHeaderPos?: ContentScrollPosType;
  activeLayout?: 'full' | 'boxed';
  activeThemeLayout?: 'vertical' | 'horizontal';
  activeDir?: I18nDirType;
  activeTheme?: ThemeType;
  activeLogoBg?: string;
  activeNavbarBg?: string;
  activeSidebarBg?: string;
};

export function getSettingsInitialState(): SettingsStateType {
  return {
    logoText: String(defaultSettings.title) ?? 'Nostalgia',

    isSettingsCogButtonShown: true,

    sidebarVisibleMode: 'auto',
    activeSidebarType: 'full',
    activeSidebarPos: 'fixed',
    activeSidePanelType: 'overlay',
    activeSidePanelPos: 'fixed',
    isSidePanelShown: false,
    activeHeaderPos: 'fixed',
    activeLayout: 'full',
    activeThemeLayout: 'vertical',
    activeDir: 'ltr',
    activeTheme: 'light',
    activeLogoBg: 'skin6',
    activeNavbarBg: 'skin6',
    activeSidebarBg: 'skin6',
  };
}

export function settingsReducer(
  state = getSettingsInitialState(),
  action,
): SettingsStateType {
  switch (action.type) {
    case RESET_TO_DEFAULT_LAYOUT:
      return getSettingsInitialState();
    case LOGO_BG:
      return {
        ...state,
        activeLogoBg: action.payload,
      };
    case NAVBAR_BG:
      return {
        ...state,
        activeNavbarBg: action.payload,
      };
    case SIDEBAR_BG:
      return {
        ...state,
        activeSidebarBg: action.payload,
      };
    case THEME:
      return {
        ...state,
        activeTheme: action.payload,
      };
    case DIRECTION:
      return {
        ...state,
        activeDir: action.payload,
      };
    case LAYOUT:
      return {
        ...state,
        activeLayout: action.payload,
      };
    case HEADER_POSITION:
      return {
        ...state,
        activeHeaderPos: action.payload,
      };
    case SIDEBAR_POSITION:
      return {
        ...state,
        activeSidebarPos: action.payload,
      };
    case SIDEBAR_TYPE:
      return {
        ...state,
        activeSidebarType: action.payload,
      };
    case SIDE_PANEL_TYPE:
      return {
        ...state,
        activeSidePanelType: action.payload,
      };
    case SIDE_PANEL_POSITION:
      return {
        ...state,
        activeSidePanelPos: action.payload,
      };
    case SIDEBAR_VISIBLE_MODE:
      return {
        ...state,
        sidebarVisibleMode: action.payload,
      };
    case TOGGLE_SIDE_PANEL:
      return {
        ...state,
        isSidePanelShown: !state.isSidePanelShown,
      };
    case TOGGLE_SETTINGS_COG_BUTTON:
      return {
        ...state,
        isSettingsCogButtonShown: !state.isSettingsCogButtonShown,
      };
    default:
      return state;
  }
}

export default settingsReducer;
