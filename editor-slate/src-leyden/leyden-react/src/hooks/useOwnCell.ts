import { type Cell, type CellType } from 'leyden';
import { type Descendant } from 'slate';

import { useCell } from './useCell';
import { useCoordinates } from './useCoordinates';

export type UseOwnCell = <T extends CellType = CellType>(
  node: Descendant,
  options?: {
    type?: T;
  },
) => Cell<T> | null;

export const useOwnCell: UseOwnCell = <T extends CellType = CellType>(
  node: Descendant,
  options: {
    type?: T;
  } = {},
) => {
  const coords = useCoordinates(node);
  const cell = useCell(coords, options);
  return cell;
};
