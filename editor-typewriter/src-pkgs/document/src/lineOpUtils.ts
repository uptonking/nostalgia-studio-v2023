import { Op } from '@typewriter/delta';

import { LineOpIterator } from './LineOp';
import type { Line, LineIds } from './lineUtils';

export function iterator(lines: Line[], lineIds?: LineIds) {
  return new LineOpIterator(lines, lineIds);
}

export function length(op: Op): number {
  return Op.length(op);
}
