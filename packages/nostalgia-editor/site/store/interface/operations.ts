// import { ThunkAction } from 'redux-thunk';

import { AppActions } from '../../common/types';
import {
  setInterfaceIsOpen,
  setInterfacePosition,
  setInterfaceWidth,
} from './actions';
import { InterfaceName, InterfacePosition } from './types';
import { AppState } from '..';

export const toggleInterfaceItem =
  (
    name: InterfaceName,
    value: boolean | undefined = undefined,
    // ): ThunkAction<void, AppState, unknown, AppActions> =>
  ) =>
  (dispatch, getState) => {
    const isOpen = getState().interface[name].isOpen;

    dispatch(setInterfaceIsOpen(name, value === undefined ? !isOpen : value));
  };

export const toggleInterfacePosition =
  (
    name: InterfaceName,
    position: InterfacePosition,
    // ): ThunkAction<void, AppState, unknown, AppActions> =>
  ) =>
  (dispatch) => {
    dispatch(setInterfacePosition(name, position));
  };

export const toggleInterfaceWidth =
  (
    name: InterfaceName,
    width: number,
    // ): ThunkAction<void, AppState, unknown, AppActions> =>
  ) =>
  (dispatch) => {
    dispatch(setInterfaceWidth(name, width));
  };
