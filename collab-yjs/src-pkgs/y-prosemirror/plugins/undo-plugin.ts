import { Plugin, type Command } from 'prosemirror-state'; // eslint-disable-line
import { ContentType, Item, Text, UndoManager, XmlElement } from 'yjs';

import { ySyncPluginKey, yUndoPluginKey } from './keys';
import { getRelativeSelection } from './sync-plugin';

export const undo: Command = (state) => {
  const undoManager = yUndoPluginKey.getState(state).undoManager;
  if (undoManager != null) {
    undoManager.undo();
    return true;
  }
  return false;
};

export const redo: Command = (state) => {
  const undoManager = yUndoPluginKey.getState(state).undoManager;
  if (undoManager != null) {
    undoManager.redo();
    return true;
  }
  return false;
};

export const defaultProtectedNodes = new Set(['paragraph']);

export const defaultDeleteFilter = (item, protectedNodes) =>
  !(item instanceof Item) ||
  !(item.content instanceof ContentType) ||
  !(
    item.content.type instanceof Text ||
    (item.content.type instanceof XmlElement &&
      protectedNodes.has(item.content.type.nodeName))
  ) ||
  item.content.type._length === 0;

export const yUndoPlugin = ({
  protectedNodes = defaultProtectedNodes,
  trackedOrigins = [],
  undoManager = null,
} = {}) =>
  new Plugin({
    key: yUndoPluginKey,
    state: {
      init: (initargs, state) => {
        // TODO: check if plugin order matches and fix
        const ystate = ySyncPluginKey.getState(state);
        const _undoManager =
          undoManager ||
          new UndoManager(ystate.type, {
            trackedOrigins: new Set(
              [ySyncPluginKey].concat(trackedOrigins),
            ) as any,
            // @ts-ignore
            deleteFilter: (item) => defaultDeleteFilter(item, protectedNodes),
            // @ts-ignore
            captureTransaction: (tr) => tr.meta.get('addToHistory') !== false,
          });
        return {
          undoManager: _undoManager,
          prevSel: null,
          hasUndoOps: _undoManager.undoStack.length > 0,
          hasRedoOps: _undoManager.redoStack.length > 0,
        };
      },
      /**
       * @returns {any}
       */
      // @ts-ignore
      apply: (tr, val, oldState, state) => {
        const binding = ySyncPluginKey.getState(state).binding;
        const undoManager = val.undoManager;
        const hasUndoOps = undoManager.undoStack.length > 0;
        const hasRedoOps = undoManager.redoStack.length > 0;
        if (binding) {
          return {
            undoManager,
            prevSel: getRelativeSelection(binding, oldState),
            hasUndoOps,
            hasRedoOps,
          };
        } else {
          if (hasUndoOps !== val.hasUndoOps || hasRedoOps !== val.hasRedoOps) {
            return {
              ...val,
              hasUndoOps: undoManager.undoStack.length > 0,
              hasRedoOps: undoManager.redoStack.length > 0,
            };
          } else {
            // nothing changed
            return val;
          }
        }
      },
    },
    view: (view) => {
      const ystate = ySyncPluginKey.getState(view.state);
      const undoManager = yUndoPluginKey.getState(view.state).undoManager;
      undoManager.on('stack-item-added', ({ stackItem }) => {
        const binding = ystate.binding;
        if (binding) {
          stackItem.meta.set(
            binding,
            yUndoPluginKey.getState(view.state).prevSel,
          );
        }
      });
      undoManager.on('stack-item-popped', ({ stackItem }) => {
        const binding = ystate.binding;
        if (binding) {
          binding.beforeTransactionSelection =
            stackItem.meta.get(binding) || binding.beforeTransactionSelection;
        }
      });
      return {
        destroy: () => {
          undoManager.destroy();
        },
      };
    },
  });
