import { type Action } from '@logux/core';

import { loguxUndo } from '../index';

function processAction(action: Action): void {
  if (loguxUndo.match(action)) {
    console.log(action.action);
  }
}

processAction(
  loguxUndo({
    id: '1 1:1:0 0',
    reason: 'error',
    action: { type: 'some' },
  }),
);
