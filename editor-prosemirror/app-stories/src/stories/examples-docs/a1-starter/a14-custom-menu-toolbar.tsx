import {
  baseKeymap,
  setBlockType,
  toggleMark,
  wrapIn,
} from 'prosemirror-commands';
import { applyDevTools } from 'prosemirror-dev-toolkit';
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';
import { MenuItem } from 'prosemirror-menu';
import { DOMParser, NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import {
  Command,
  EditorState,
  Plugin,
  type PluginView,
} from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

import { StyledProseMirrorCore } from '../editor-examples.styles';
import { keymap } from 'prosemirror-keymap';

const StyledDemoContainer = styled(StyledProseMirrorCore)`
  .menubar {
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    line-height: 0.1;
  }
  .menuicon {
    display: inline-block;
    border-right: 1px solid rgba(0, 0, 0, 0.2);
    color: #888;
    line-height: 1;
    padding: 0 7px;
    margin: 1px;
    cursor: pointer;
    text-align: center;
    min-width: 1.4em;
  }
  .strong,
  .heading {
    font-weight: bold;
  }
  .em {
    font-style: italic;
  }
`;

class MenuView implements PluginView {
  [x: string]: any;

  constructor(items, editorView) {
    this.items = items;
    this.editorView = editorView;

    this.dom = document.createElement('div');
    this.dom.className = 'menubar';
    items.forEach(({ dom }) => this.dom.appendChild(dom));
    this.update();

    this.dom.addEventListener('mousedown', (e) => {
      e.preventDefault();
      editorView.focus();
      items.forEach(({ command, dom }) => {
        if (dom.contains(e.target))
          command(editorView.state, editorView.dispatch, editorView);
      });
    });
  }

  update() {
    this.items.forEach(({ command, dom }) => {
      const active = command(this.editorView.state, null, this.editorView);
      dom.style.display = active ? '' : 'none';
    });
  }

  destroy() {
    this.dom.remove();
  }
}

function menuPlugin(items) {
  return new Plugin({
    view(editorView) {
      const menuView = new MenuView(items, editorView);
      editorView.dom.parentNode.insertBefore(menuView.dom, editorView.dom);
      return menuView;
    },
  });
}

// Helper function to create menu icons
function icon(text, name) {
  const span = document.createElement('span');
  span.className = 'menuicon ' + name;
  span.title = name;
  span.textContent = text;
  return span;
}

// Create an icon for a heading at the given level
function heading(level) {
  return {
    command: setBlockType(schema.nodes.heading, { level }),
    dom: icon('H' + level, 'heading'),
  };
}

const menu = menuPlugin([
  { command: toggleMark(schema.marks.strong), dom: icon('B', 'strong') },
  { command: toggleMark(schema.marks.em), dom: icon('i', 'em') },
  {
    command: setBlockType(schema.nodes.paragraph),
    dom: icon('p', 'paragraph'),
  },
  heading(1),
  heading(2),
  heading(3),
  { command: wrapIn(schema.nodes.blockquote), dom: icon('>', 'blockquote') },
]);

/**
 * ✨ 官方编辑器示例，自定义Node/元素 。
 * - https://prosemirror.net/examples/dino/
 */
export const CustomMenuToolbar = () => {
  const editorContainer = useRef<HTMLDivElement>();
  const initialContentContainer = useRef<HTMLDivElement>();
  const view = useRef<EditorView>(null);

  useEffect(() => {
    const state = EditorState.create({
      doc: DOMParser.fromSchema(schema).parse(initialContentContainer.current),
      plugins: [keymap(baseKeymap), menu],
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
        <h3>Custom menu toolbar in ProseMirror</h3>
        <p>With a very crude menu bar.</p>
      </div>
    </StyledDemoContainer>
  );
};
