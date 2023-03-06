import { createContext, useContext } from 'react';

import { Editor } from 'slate';

import { ReactEditor } from '../plugin/react-editor';

/**
 * A React context for sharing the editor object, in a way that re-renders the
 * context whenever changes occur.
 *
 * ? 为什么用数组
 */
export const SlateContext = createContext<[ReactEditor] | null>(null);

/**
 * Get the current editor object from the React context.
 * - Re-renders the context whenever changes occur in the editor.
 */
export const useSlate = (): Editor => {
  const context = useContext(SlateContext);

  if (!context) {
    throw new Error(
      `The \`useSlate\` hook must be used inside the <Slate> component's context.`,
    );
  }

  const [editor] = context;
  return editor;
};
