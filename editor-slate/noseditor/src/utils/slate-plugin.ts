import React, { DOMAttributes, SyntheticEvent } from 'react';

import { flatten, mergeWith } from 'ramda';
import { Editor } from 'slate';

/** a typical slate plugin. a function that takes an Editor object and returns it after augment it */
type Plugin = (editor: Editor) => Editor;

/** apply plugin in reverse order */
export const composePlugins = (plugins: Plugin[], _editor: Editor) => {
  let editor = _editor;
  for (const plugin of plugins.reverse()) {
    editor = plugin(editor);
  }

  return editor;
};

type KeysMatching<T extends object, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

type Handler = React.EventHandler<SyntheticEvent> | undefined;
type EditorHandler = (editor: Editor) => Handler;
type DOMHandlersKeys = KeysMatching<DOMAttributes<Element>, Handler>;

/**
 * compose event handlers of the same name into one event
 */
export const composeHandlers = (
  editor: Editor,
  handlersConfig: Partial<Record<DOMHandlersKeys, EditorHandler>>[],
) => {
  const grouped = handlersConfig.reduce(
    (acc, x) => mergeWith((a, b) => flatten([a, b]), acc, x),
    {},
  ) as Record<DOMHandlersKeys, Array<EditorHandler>>;

  const composed: Partial<Record<string, Handler>> = {};
  for (const [eventName, callbacks] of Object.entries(grouped)) {
    composed[eventName] = (e: SyntheticEvent) =>
      callbacks.forEach((handler) => handler && handler(editor)!(e));
  }

  return composed as Partial<Record<DOMHandlersKeys, Handler>>;
};
