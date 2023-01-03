import { MemoryLevel as ClassicLevel } from 'memory-level';

import si from './main';

export default function startNode(ops) {
  return si({
    db: ClassicLevel,
    ...ops,
  });
}
