// import { applyDevTools } from 'prosemirror-dev-tools';
import { applyDevTools } from 'prosemirror-dev-toolkit';
import { schema } from 'prosemirror-schema-basic';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { useEffect, useRef, useState } from 'react';

import { StyledProseMirrorCore } from '../editor-examples.styles';

const initialValue = [
  {
    type: 'paragraph',
    children: [
      { text: '👏 Hello, ProseMirror editor!  A line of text in a paragraph.' },
    ],
  },
];

/**
 * ✨ 最小编辑器示例，不支持回车换行
 */
export const PMMinimalApp = () => {
  const editorContainer = useRef<HTMLDivElement>();
  const view = useRef<EditorView>(null);

  useEffect(() => {
    const state = EditorState.create({ schema });
    view.current = new EditorView(editorContainer.current, { state });
    applyDevTools(view.current, { devToolsExpanded: true });

    return () => view.current.destroy();
  }, []);

  return (
    <StyledProseMirrorCore>
      <h3> ProseMirror Minimal Editor 202209</h3>
      <div ref={editorContainer} />
    </StyledProseMirrorCore>
  );
};
