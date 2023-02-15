import React, { useEffect, useRef, useState } from 'react';

import { Editor, h } from 'typewriter-editor';
import {
  virtualRendering,
} from 'typewriter-editor/src/modules/virtualRendering';

/**
 * ✨ virtual render editor 。
 *
 * - 👉🏻 本示例要点
 */
export const VirtualRenderEditor = () => {
  const editorContainer = useRef<HTMLDivElement>();
  const initialContentContainer = useRef<HTMLDivElement>();
  const view = useRef(null);

  useEffect(() => {
    const editor = new Editor({
      text: 'Hello\nWorld',
      modules: {
        rendering: virtualRendering,
      },
    });
    editor.setRoot(editorContainer.current);

    let bigStr = '';
    Array(16)
      .fill(0)
      .forEach((x, i) => {
        // bigStr += '\n' + (i + 1) + ' ' + Math.random();
        bigStr += '\n' + (i + 1) + 'Format for representing rich text documents and changes.';
      });
    editor.setText(bigStr);

    window['ed'] = editor;
    // return () => view.current.destroy();
  }, []);

  return (
    <>
      <h3>Virtual Render</h3>
      <div
        ref={editorContainer}
        id='editor'
        style={{ height: 240, overflowY: 'auto' }}
      />
    </>
  );
};
