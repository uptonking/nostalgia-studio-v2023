import {
  baseKeymap,
  setBlockType,
  toggleMark,
  wrapIn,
} from 'prosemirror-commands';
import { DOMParser, NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { applyDevTools } from 'prosemirror-dev-toolkit';
import { schema } from 'prosemirror-schema-basic';
import {
  Command,
  EditorState,
  Plugin,
  type PluginView,
} from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { keymap } from 'prosemirror-keymap';
import React, { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

import { StyledProseMirrorCore } from '../editor-examples.styles';

type CmdWithIcon = {
  command: Command;
  dom: HTMLSpanElement;
};

class MenuView implements PluginView {
  items: CmdWithIcon[];
  editorView: EditorView;
  /** menubar container */
  dom: HTMLDivElement;

  constructor(items: CmdWithIcon[], editorView: EditorView) {
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
        if (e.target instanceof HTMLElement && dom.contains(e.target))
          command(editorView.state, editorView.dispatch, editorView);
      });
    });
  }

  update() {
    // 每次editorState变化都会执行这里更新按钮状态
    this.items.forEach(({ command, dom }) => {
      const active = command(this.editorView.state, null, this.editorView);
      // 不可用的cmd会隐藏掉
      dom.style.display = active ? '' : 'none';
    });
  }

  destroy() {
    // `Element.remove()` method removes the element from the DOM.
    this.dom.remove();
  }
}

/** 在editorView的dom前插入menubar的dom，pluginView会注册update方法随editorState更新 */
function createMenuPlugin(items: CmdWithIcon[]) {
  return new Plugin<{}>({
    view(editorView) {
      const menuView = new MenuView(items, editorView);
      editorView.dom.parentNode.insertBefore(menuView.dom, editorView.dom);
      return menuView;
    },
  });
}

/** Helper function to create menu icons，每个icon都是span元素 */
function icon(text: string, name: string) {
  const span = document.createElement('span');
  span.className = 'menuicon ' + name;
  span.title = name;
  span.textContent = text;
  return span;
}

/** Create an icon for a heading at the given level */
function heading(level: string | number) {
  return {
    command: setBlockType(schema.nodes.heading, { level }),
    dom: icon('H' + level, 'heading'),
  };
}

const menuPlugin = createMenuPlugin([
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
 * ✨ 官方编辑器示例，自定义toolbar工具条 。
 * - https://prosemirror.net/examples/menu/
 *
 * - 👉🏻 本示例要点
 * - 当cmd不可用时会隐藏工具条对应按钮，此设计也许导致性能问题
 *   - update the menu structure every time the editor state changes
 *   - Depending on the number of items in your menu, and the amount of work required for determining whether they are applicable, this can get expensive.
 *   - There's no real solution for this, except either keeping the number and complexity of the commands low, or not changing the look of your menu depending on state.
 * - 每当editorState update时，pluginView的update()也会执行
 */
export const CustomMenuToolbar = () => {
  const editorContainer = useRef<HTMLDivElement>();
  const initialContentContainer = useRef<HTMLDivElement>();
  const view = useRef<EditorView>(null);

  useEffect(() => {
    const state = EditorState.create({
      doc: DOMParser.fromSchema(schema).parse(initialContentContainer.current),
      plugins: [keymap(baseKeymap), menuPlugin],
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
        <blockquote> test blockquote</blockquote>
      </div>
    </StyledDemoContainer>
  );
};

const StyledDemoContainer = styled(StyledProseMirrorCore)`
  .ProseMirror blockquote {
    padding-left: 1em;
    border-left: 3px solid #eee;
    margin-left: 0;
    margin-right: 0;
  }
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
