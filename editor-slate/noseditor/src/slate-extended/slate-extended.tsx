import React, { Fragment, useMemo, useState } from 'react';

import { useSlate } from 'slate-react';

import { ExtendedEditor } from './extended-editor';
import { ELEMENT_TO_SEMANTIC_PATH } from './weakmaps';

/**
 * compute `semanticChildren` and add to editor instance
 *
 * todo move this logic inside Editable to avoid error when Editable rerendered but this SlateExtended not rerendered
 */
export const SlateExtended = (props: { children: React.ReactNode }) => {
  const editor = useSlate();
  const { children } = props;
  // console.log(';; render-SlateExtended');

  const initializeExtendedEditor = () => {
    editor.semanticChildren = ExtendedEditor.getSemanticChildren(
      editor,
      editor.children,
      {
        setPath: (element, path) => {
          ELEMENT_TO_SEMANTIC_PATH.set(element, path);
        },
      },
    );
    // console.log(';; sem-chd ', editor.children[0].children[0], ELEMENT_TO_SEMANTIC_PATH);
  };

  // todo refactor to useLayoutEffect
  useState(() => {
    // console.log(';; sem-chd-init ',);
    return initializeExtendedEditor();
  });
  // no return ?
  useMemo(initializeExtendedEditor, [editor.children]);
  // initializeExtendedEditor()

  return <Fragment>{children}</Fragment>;
};
