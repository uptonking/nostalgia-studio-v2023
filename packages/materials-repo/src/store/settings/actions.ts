import type {
  ContentScrollPosType,
  SidebarType,
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
} from '../actions-constants';
import { SET_LOGO_TEXT } from './constants';

export const resetToDefaultLayoutSettings = () => {
  return { type: RESET_TO_DEFAULT_LAYOUT };
};

export const setLogoText = ({ logoText }) => {
  return {
    type: SET_LOGO_TEXT,
    payload: {
      logoText,
    },
  };
};

export const setLogoBg = (payload) => {
  return {
    type: LOGO_BG,
    payload,
  };
};

export const setNavbarBg = (payload) => {
  return {
    type: NAVBAR_BG,
    payload,
  };
};

export const setSidebarBg = (payload) => {
  return {
    type: SIDEBAR_BG,
    payload,
  };
};

export const setTheme = (payload: 'light' | 'dark') => {
  return {
    type: THEME,
    payload,
  };
};

export const setDir = (payload: 'ltr' | 'rtl') => {
  return {
    type: DIRECTION,
    payload,
  };
};

export const setHeaderPos = (payload: ContentScrollPosType) => {
  return {
    type: HEADER_POSITION,
    payload,
  };
};

export const setLayout = (payload: 'full' | 'boxed') => {
  return {
    type: LAYOUT,
    payload,
  };
};

export const setSidebarType = (payload: SidebarType) => {
  return {
    type: SIDEBAR_TYPE,
    payload,
  };
};

export const setSidebarPos = (payload: ContentScrollPosType) => {
  return {
    type: SIDEBAR_POSITION,
    payload,
  };
};
export const setSidebarVisibleMode = (
  payload: 'visible' | 'hidden' | 'auto' | 'full2mini' | 'mini2full',
) => {
  return {
    type: SIDEBAR_VISIBLE_MODE,
    payload,
  };
};

export const setSidePanelType = (payload: 'overlay' | 'dock') => {
  return {
    type: SIDE_PANEL_TYPE,
    payload,
  };
};

export const setSidePanelPos = (payload: ContentScrollPosType) => {
  return {
    type: SIDE_PANEL_POSITION,
    payload,
  };
};
