import type { Transaction } from 'prosemirror-state';

import type { Dispatch } from '../../../event-dispatcher';

export type AlignmentState = 'start' | 'end' | 'center';
export type AlignmentPluginState = {
  align: AlignmentState;
  isEnabled?: boolean;
};
export type ActionHandlerParams = {
  dispatch: Dispatch;
  pluginState: AlignmentPluginState;
  tr: Transaction;
  params?: {
    align?: string;
    disabled?: boolean;
  };
};
