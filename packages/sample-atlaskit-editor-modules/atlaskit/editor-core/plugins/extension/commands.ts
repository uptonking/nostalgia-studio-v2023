import { removeParentNodeOfType, removeSelectedNode } from 'prosemirror-utils';

import type { ExtensionLayout } from '../../../adf-schema';
// AFP-2532 TODO: Fix automatic suppressions below
import type {
  Parameters,
  TransformAfter,
  TransformBefore,
} from '../../../editor-common/extensions';
import { applyChange } from '../context-panel/transforms';
import { createCommand } from './plugin-factory';
import { ExtensionAction, ExtensionState } from './types';
import { getSelectedExtension } from './utils';

export function updateState(state: Partial<ExtensionState>) {
  return createCommand({
    type: 'UPDATE_STATE',
    data: state,
  });
}

export function setEditingContextToContextPanel<
  T extends Parameters = Parameters,
>(
  processParametersBefore: TransformBefore<T>,
  processParametersAfter: TransformAfter<T>,
) {
  return createCommand<ExtensionAction<T>>(
    {
      type: 'UPDATE_STATE',
      data: {
        showContextPanel: true,
        processParametersBefore,
        processParametersAfter,
      },
    },
    applyChange,
  );
}

export const clearEditingContext = createCommand(
  {
    type: 'UPDATE_STATE',
    data: {
      showContextPanel: false,
      processParametersBefore: undefined,
      processParametersAfter: undefined,
    },
  },
  applyChange,
);

export const forceAutoSave = (value: () => void) =>
  createCommand(
    {
      type: 'UPDATE_STATE',
      data: { autoSaveResolve: value },
    },
    applyChange,
  );

export const showContextPanel = createCommand(
  {
    type: 'UPDATE_STATE',
    data: { showContextPanel: true },
  },
  applyChange,
);

export const updateExtensionLayout = (layout: ExtensionLayout) =>
  createCommand({ type: 'UPDATE_STATE', data: { layout } }, (tr, state) => {
    const selectedExtension = getSelectedExtension(state, true);

    if (selectedExtension) {
      return tr.setNodeMarkup(selectedExtension.pos, undefined, {
        ...selectedExtension.node.attrs,
        layout,
      });
    }

    return tr;
  });

export const removeExtension = () =>
  createCommand(
    {
      type: 'UPDATE_STATE',
      data: { element: undefined },
    },
    (tr, state) => {
      if (getSelectedExtension(state)) {
        return removeSelectedNode(tr);
      } else {
        return removeParentNodeOfType(state.schema.nodes.bodiedExtension)(tr);
      }
    },
  );
