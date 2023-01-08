// import { ClassicLevel } from 'classic-level';
import { MemoryLevel as ClassicLevel } from 'memory-level';

import fii from './main';

export default function startNode(ops) {
  return fii({
    db: ClassicLevel,
    ...ops,
  });
}
