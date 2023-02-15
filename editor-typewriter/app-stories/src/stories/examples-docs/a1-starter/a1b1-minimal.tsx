import React, { useEffect, useRef, useState } from 'react';

import { Editor } from 'typewriter-editor';

import { ckEditorFullEgData, tinymce6EgData } from './examples-data';

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
    const editor = new Editor({
      // html: '<p>Edit this <b>content</b> as u like</p><p>Edit this <b>content</b> as u like</p>',
      html: tinymce6EgData
    });
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
