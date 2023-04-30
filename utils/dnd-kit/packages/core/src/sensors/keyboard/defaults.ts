import { KeyboardCode, KeyboardCodes, KeyboardCoordinateGetter } from './types';

export const defaultKeyboardCodes: KeyboardCodes = {
  start: [KeyboardCode.Space, KeyboardCode.Enter],
  cancel: [KeyboardCode.Esc],
  end: [KeyboardCode.Space, KeyboardCode.Enter],
};

/**
 * By default, the Keyboard sensor moves in any given direction by 25 pixels when any of the arrow keys are pressed while dragging.
 * - This is an arbitrary sensible default that you can customize by your own coordGetter
 */
export const defaultKeyboardCoordinateGetter: KeyboardCoordinateGetter = (
  event,
  { currentCoordinates },
) => {
  switch (event.code) {
    case KeyboardCode.Right:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x + 25,
      };
    case KeyboardCode.Left:
      return {
        ...currentCoordinates,
        x: currentCoordinates.x - 25,
      };
    case KeyboardCode.Down:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y + 25,
      };
    case KeyboardCode.Up:
      return {
        ...currentCoordinates,
        y: currentCoordinates.y - 25,
      };
  }

  return undefined;
};
