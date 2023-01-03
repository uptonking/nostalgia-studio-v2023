import { BrowserLevel } from 'browser-level';

import fii from './main';

export default function startWeb(ops) {
  return fii({
    db: BrowserLevel,
    ...ops,
  });
}
