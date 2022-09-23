import { applyDevTools } from 'prosemirror-dev-toolkit';
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';
import { DOMParser, NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import {
  EditorState,
  Plugin,
  TextSelection,
  Transaction,
  type Command,
} from 'prosemirror-state';
import { Decoration, DecorationSet, EditorView } from 'prosemirror-view';
import React, { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

import { StyledContainer } from '../editor-examples.styles';

/** Words you probably shouldn't use */
const badWords = /\b(obviously|clearly|evidently|simply)\b/gi;
/** Matches punctuation with a space before it */
const badPunc = / ([,\.!?:]) ?/g;

type CommandParams = {
  state: Parameters<Command>[0];
  dispatch: Parameters<Command>[1];
};

/**  */
function lint(doc) {
  const result = [];
  let lastHeadLevel = null;

  function record(msg, from, to, fix) {
    result.push({ msg, from, to, fix });
  }

  // For each node in the document
  doc.descendants((node, pos) => {
    if (node.isText) {
      // Scan text nodes for suspicious patterns
      let m;
      while ((m = badWords.exec(node.text)))
        record(
          `Try not to say '${m[0]}'`,
          pos + m.index,
          pos + m.index + m[0].length,
          undefined,
        );
      while ((m = badPunc.exec(node.text)))
        record(
          'Suspicious spacing around punctuation',
          pos + m.index,
          pos + m.index + m[0].length,
          fixPunc(m[1] + ' '),
        );
    } else if (node.type.name == 'heading') {
      // Check whether heading levels fit under the current level
      const level = node.attrs.level;
      if (lastHeadLevel != null && level > lastHeadLevel + 1)
        record(
          `Heading too small (${level} under ${lastHeadLevel})`,
          pos + 1,
          pos + 1 + node.content.size,
          fixHeader(lastHeadLevel + 1),
        );
      lastHeadLevel = level;
    } else if (node.type.name == 'image' && !node.attrs.alt) {
      // Ensure images have alt text
      record('Image without alt text', pos, pos + 1, addAlt);
    }
  });

  return result;
}

/**  */
function fixPunc(replacement) {
  return function ({ state, dispatch }: CommandParams) {
    dispatch(
      // @ts-ignore
      state.tr.replaceWith(this.from, this.to, state.schema.text(replacement)),
    );
  };
}

function fixHeader(level) {
  return function ({ state, dispatch }: CommandParams) {
    // @ts-ignore
    dispatch(state.tr.setNodeMarkup(this.from - 1, null, { level }));
  };
}

function addAlt({ state, dispatch }: CommandParams) {
  const alt = prompt('Alt text', '');
  if (alt) {
    // @ts-ignore
    const attrs = { ...state.doc.nodeAt(this.from).attrs, alt };
    // @ts-ignore
    dispatch(state.tr.setNodeMarkup(this.from, null, attrs));
  }
}

function lintDeco(doc) {
  const decos = [];
  lint(doc).forEach((prob) => {
    decos.push(
      Decoration.inline(prob.from, prob.to, { class: 'problem' }),
      Decoration.widget(prob.from, lintIcon(prob)),
    );
  });
  return DecorationSet.create(doc, decos);
}

function lintIcon(prob) {
  const icon = document.createElement('div');
  icon.className = 'lint-icon';
  icon.title = prob.msg;
  // @ts-ignore
  icon.problem = prob;
  return icon;
}

const lintPlugin = new Plugin({
  state: {
    init(_, { doc }) {
      return lintDeco(doc);
    },
    apply(tr, old) {
      return tr.docChanged ? lintDeco(tr.doc) : old;
    },
  },
  props: {
    decorations(state) {
      return this.getState(state);
    },
    handleClick(view, _, event) {
      const element = event.target as HTMLDivElement;
      if (/lint-icon/.test(element.className)) {
        // @ts-ignore
        const { from, to } = element.problem;
        view.dispatch(
          view.state.tr
            .setSelection(TextSelection.create(view.state.doc, from, to))
            .scrollIntoView(),
        );
        return true;
      }
      return false;
    },
    handleDoubleClick(view, _, event) {
      const element = event.target as HTMLDivElement;
      if (/lint-icon/.test(element.className)) {
        // @ts-ignore
        const prob = element.problem;
        if (prob.fix) {
          prob.fix(view);
          view.focus();
          return true;
        }
      }
      return false;
    },
  },
});

/**
 * ✨ 官方编辑器示例，基于pluginView实现lint 。
 * - https://prosemirror.net/examples/lint/
 *
 * - 👉🏻 本示例要点
 */
export const Lint = () => {
  const editorContainer = useRef<HTMLDivElement>();
  const initialContentContainer = useRef<HTMLDivElement>();
  const view = useRef<EditorView>(null);

  useEffect(() => {
    const state = EditorState.create({
      doc: DOMParser.fromSchema(schema).parse(initialContentContainer.current),
      plugins: exampleSetup({
        schema,
      }).concat(lintPlugin),
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
        <h3>Lint in ProseMirror: 单击侧边选中内容，双击侧边修复问题</h3>

        <p>This is a sentence ,but the comma isn't in the right place.</p>
        <h5>Too-minor header</h5>
        <p>
          This is an image <img src='/img/smiley.png' /> without alt text. You
          can hover over the icons on the right to see what the problem is,
          click them to select the relevant text, and, obviously, double-click
          them to automatically fix it (if supported).
        </p>
      </div>
    </StyledDemoContainer>
  );
};

const StyledDemoContainer = styled(StyledContainer)`
  #editor {
    position: relative;
  }
  .problem {
    background: #fdd;
    border-bottom: 1px solid #f22;
    margin-bottom: -1px;
  }
  .lint-icon {
    display: inline-block;
    position: absolute;
    right: 2px;
    cursor: pointer;
    border-radius: 100px;
    background: #f22;
    color: white;
    font-family: times, georgia, serif;
    font-size: 15px;
    font-weight: bold;
    width: 1.1em;
    height: 1.1em;
    text-align: center;
    padding-left: 0.5px;
    line-height: 1.1em;
  }
  .lint-icon:before {
    content: '!';
  }
  .ProseMirror {
    padding-right: 20px;
  }
`;
