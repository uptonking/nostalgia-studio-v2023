import * as types from './types';

export function setInterfaceIsOpen(
  name: types.InterfaceName,
  isOpen: boolean,
): types.ISetIsOpenAction {
  return {
    type: types.SET_IS_OPEN,
    payload: {
      name,
      isOpen,
    },
  };
}

export function setInterfacePosition(
  name: types.InterfaceName,
  position: types.InterfacePosition,
): types.ISetPositionAction {
  return {
    type: types.SET_POSITION,
    payload: {
      name,
      position,
    },
  };
}

export function setInterfaceWidth(
  name: types.InterfaceName,
  width: number,
): types.ISetWidthAction {
  return {
    type: types.SET_WIDTH,
    payload: {
      name,
      width,
    },
  };
}
