import { applyDevTools } from 'prosemirror-dev-toolkit';
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';
import { MenuItem } from 'prosemirror-menu';
import { DOMParser, NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { Command, EditorState, Plugin } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

import { StyledContainer } from '../editor-examples.styles';

const StyledDemoContainer = styled(StyledContainer)`
  .tooltip {
    position: absolute;
    pointer-events: none;
    z-index: 20;
    background: white;
    border: 1px solid silver;
    border-radius: 2px;
    padding: 2px 10px;
    margin-bottom: 7px;
    -webkit-transform: translateX(-50%);
    transform: translateX(-50%);
  }
  .tooltip:before {
    content: '';
    height: 0;
    width: 0;
    position: absolute;
    left: 50%;
    margin-left: -5px;
    bottom: -6px;
    border: 5px solid transparent;
    border-bottom-width: 0;
    border-top-color: silver;
  }
  .tooltip:after {
    content: '';
    height: 0;
    width: 0;
    position: absolute;
    left: 50%;
    margin-left: -5px;
    bottom: -4.5px;
    border: 5px solid transparent;
    border-bottom-width: 0;
    border-top-color: white;
  }
  #editor {
    position: relative;
  }
`;

const selectionSizePlugin = new Plugin({
  view(editorView) {
    return new SelectionSizeTooltip(editorView);
  },
});

class SelectionSizeTooltip {
  tooltip: HTMLDivElement;

  constructor(view) {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'tooltip';
    view.dom.parentNode.appendChild(this.tooltip);

    this.update(view, null);
  }

  update(view, lastState) {
    const state = view.state;
    // Don't do anything if the document/selection didn't change
    if (
      lastState &&
      lastState.doc.eq(state.doc) &&
      lastState.selection.eq(state.selection)
    )
      return;

    // Hide the tooltip if the selection is empty
    if (state.selection.empty) {
      this.tooltip.style.display = 'none';
      return;
    }

    // Otherwise, reposition it and update its content
    this.tooltip.style.display = '';
    const { from, to } = state.selection;
    // These are in screen coordinates
    const start = view.coordsAtPos(from);
    const end = view.coordsAtPos(to);
    // The box in which the tooltip is positioned, to use as base
    const box = this.tooltip.offsetParent.getBoundingClientRect();
    // Find a center-ish x position from the selection endpoints (when
    // crossing lines, end may be more to the left)
    const left = Math.max((start.left + end.left) / 2, start.left + 3);
    this.tooltip.style.left = left - box.left + 'px';
    this.tooltip.style.bottom = box.bottom - start.top + 'px';
    this.tooltip.textContent = String(to - from);
  }

  destroy() {
    this.tooltip.remove();
  }
}

/**
 * ✨ 官方编辑器示例，自定义tooltip 。
 * - https://prosemirror.net/examples/tooltip/
 *
 * - 👉🏻 本示例要点
 * - 弹出层会显示当前选中的包含空白的字符数量，并且鼠标拖选移动时数量会实时更新
 */
export const EditorTooltipPopover = () => {
  const editorContainer = useRef<HTMLDivElement>();
  const initialContentContainer = useRef<HTMLDivElement>();
  const view = useRef<EditorView>(null);

  useEffect(() => {
    const state = EditorState.create({
      doc: DOMParser.fromSchema(schema).parse(initialContentContainer.current),
      plugins: exampleSetup({
        schema,
      }).concat(selectionSizePlugin),
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
