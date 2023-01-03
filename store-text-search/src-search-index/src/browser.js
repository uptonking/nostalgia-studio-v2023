import { BrowserLevel } from 'browser-level';

import si from './main';

export default function startWeb(ops) {
  return si({
    db: BrowserLevel,
    ...ops,
  });
}
