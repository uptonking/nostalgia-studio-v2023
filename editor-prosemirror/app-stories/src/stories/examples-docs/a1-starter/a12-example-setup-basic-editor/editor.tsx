import { applyDevTools } from 'prosemirror-dev-toolkit';
import { exampleSetup } from 'prosemirror-example-setup';
import { DOMParser, Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { useEffect, useRef, useState } from 'react';

import { StyledContainer } from '../../editor-examples.styles';

/**
 * ✨ 官方编辑器示例，基于 prosemirror-example-setup 。
 * - https://prosemirror.net/examples/basic/
 */
export const PMExampleSetupBasicEditor = () => {
  const editorContainer = useRef<HTMLDivElement>();
  const initialEditorContentContainer = useRef<HTMLDivElement>();
  const view = useRef<EditorView>(null);

  useEffect(() => {
    // create a schema with list support.
    const mySchema = new Schema({
      nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
      marks: schema.spec.marks,
    });
    // const state = EditorState.create({ schema: mySchema });
    view.current = new EditorView(editorContainer.current, {
      state: EditorState.create({
        doc: DOMParser.fromSchema(mySchema).parse(
          initialEditorContentContainer.current,
        ),
        plugins: exampleSetup({ schema: mySchema }),
      }),
    });
    applyDevTools(view.current, { devToolsExpanded: false });

    return () => view.current.destroy();
  }, []);

  return (
    <StyledContainer>
      <h3> prosemirror-example-setup basic editor</h3>
      <div ref={editorContainer} id='editor' />
      {/* 👇🏻 剩下的全是默认隐藏的编辑器初始数据 */}
      <div style={{ display: 'none' }} ref={initialEditorContentContainer}>
        <h3>Hello ProseMirror</h3>

        <p>This is editable text. You can focus it and start typing.</p>

        <p>
          To apply styling, you can select a piece of text and manipulate its
          styling from the menu. The basic schema supports <em>emphasis</em>,{' '}
          <strong>strong text</strong>,{' '}
          <a href='http://marijnhaverbeke.nl/blog'>links</a>,{' '}
          <code>code font</code>, and <img src='/img/smiley.png' /> images.
        </p>

        <p>
          Block-level structure can be manipulated with key bindings (try
          ctrl-shift-2 to create a level 2 heading, or enter in an empty
          textblock to exit the parent block), or through the menu.
        </p>

        <p>
          Try using the “list” item in the menu to wrap this paragraph in a
          numbered list.
        </p>
      </div>
    </StyledContainer>
  );
};
