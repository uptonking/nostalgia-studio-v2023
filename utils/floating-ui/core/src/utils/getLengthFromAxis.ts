import { type Axis, type Length } from '../types';

export function getLengthFromAxis(axis: Axis): Length {
  return axis === 'y' ? 'height' : 'width';
}
