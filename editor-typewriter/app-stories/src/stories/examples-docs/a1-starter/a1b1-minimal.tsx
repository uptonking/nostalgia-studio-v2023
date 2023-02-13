import React, { useEffect, useRef, useState } from 'react';

import { Editor } from 'typewriter-editor';

const initialValue = [
  {
    type: 'paragraph',
    children: [
      { text: '👏 Hello, ProseMirror editor!  A line of text in a paragraph.' },
    ],
  },
];

/**
 * ✨ 最小编辑器示例
 */
export const EditorMinimalApp = () => {
  const editorContainer = useRef<HTMLDivElement>();
  const view = useRef(null);

  useEffect(() => {
    const editor = new Editor();
    view.current = editorContainer.current.appendChild(editor.root);

    window['ed'] = editor;
    // return () => view.current.destroy();
  }, []);

  return (
    <>
      <h3> Typewriter Editor 202302</h3>
      <div ref={editorContainer} />
    </>
  );
};
