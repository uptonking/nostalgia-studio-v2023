import { Transaction } from 'prosemirror-state';

import type { AnalyticsPayload } from '../../../adf-schema/steps';
import { InputSource } from './enums';
import { pluginKey as undoRedoPluginKey } from './pm-plugins/plugin-key';

const getUndoRedoInputSource = (tr: Transaction): InputSource | null => {
  return tr.getMeta(undoRedoPluginKey) || null;
};

export const generateUndoRedoInputSoucePayload = (tr: Transaction) => {
  const undoRedoPluginInputSource = getUndoRedoInputSource(tr);

  return <T extends AnalyticsPayload>(payload: T): T => {
    const shouldAddHistoryTriggerMethodAttribute =
      undoRedoPluginInputSource && ['undid', 'redid'].includes(payload.action);

    return !shouldAddHistoryTriggerMethodAttribute
      ? payload
      : {
          ...payload,
          attributes: {
            ...payload.attributes,
            historyTriggerMethod: undoRedoPluginInputSource,
          },
        };
  };
};
