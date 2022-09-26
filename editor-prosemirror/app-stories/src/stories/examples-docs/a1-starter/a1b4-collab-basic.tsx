import { applyDevTools } from 'prosemirror-dev-toolkit';
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';
import { DOMParser, NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { EditorState, Plugin, type PluginView } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

import { StyledContainer } from '../editor-examples.styles';

/**
 * ✨ 官方编辑器示例，基于prosemirror-collab实现协作编辑 。
 * - https://prosemirror.net/examples/collab/
 *
 * - 👉🏻 本示例要点
 */
export const ProseMirrorCollabBasic = () => {
  const editorContainer = useRef<HTMLDivElement>();
  const initialContentContainer = useRef<HTMLDivElement>();
  const view = useRef<EditorView>(null);

  useEffect(() => {
    const state = EditorState.create({
      doc: DOMParser.fromSchema(schema).parse(initialContentContainer.current),
      plugins: exampleSetup({
        schema,
      }).concat([]),
    });

    view.current = new EditorView(editorContainer.current, {
      state,
    });
    applyDevTools(view.current, { devToolsExpanded: false });

    return () => view.current.destroy();
  }, []);

  return (
    <StyledDemoContainer>
      <div ref={editorContainer} id='editor' />
      {/* 👇🏻 剩下的全是默认隐藏的编辑器初始数据 */}
      <div ref={initialContentContainer} style={{ display: 'none' }}>
        <h3>Tooltip Popover in ProseMirror</h3>

        <p>
          Select some text to see a tooltip with the size of your selection.
        </p>
        <p>
          (That's not the most useful use of a tooltip, but it's a nicely simple
          example.)
        </p>
      </div>
    </StyledDemoContainer>
  );
};

const StyledDemoContainer = styled(StyledContainer)`
  .tooltip {
    position: absolute;
    padding: 2px 10px;
    margin-bottom: 7px;
    transform: translateX(-50%);
    pointer-events: none;
    z-index: 20;
    background: white;
    border: 1px solid silver;
    border-radius: 2px;
  }

  #editor {
    position: relative;
  }
`;
