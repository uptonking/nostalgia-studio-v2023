import { baseKeymap, toggleMark } from 'prosemirror-commands';
import { applyDevTools } from 'prosemirror-dev-toolkit';
import { history, redo, undo } from 'prosemirror-history';
import { keymap } from 'prosemirror-keymap';
import { DOMParser, NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { type Command, EditorState, Plugin } from 'prosemirror-state';
import { findWrapping } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';
import React, { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

import { StyledProseMirrorCore } from '../editor-examples.styles';

/** minimal pm schema。若将编辑器的mountPlace设置为inline元素如span，则整个编辑器就是行内可编辑的 */
const minimalSchema = new Schema({
  nodes: {
    doc: { content: 'text*' },
    text: {},
  },
});

/**
 * - baseKeymap模块能正常work
 * - 文字中间回车会拆分note
 * - 文字末尾回车会创建note，在group内或不在
 * - 对空note，回车会创建note；若在group内，会先删除group内note，再跳出group并创建note
 * - group内行首的退格会将当前note合并到上一行note；若是第一行，则会跳出group
 */
const noteSchema = new Schema({
  nodes: {
    doc: {
      content: '(note | notegroup)+',
    },
    text: {},
    note: {
      content: 'text*',
      // 👇🏻 会生成自定义html标签并挂载到dom
      toDOM() {
        return ['note', 0];
      },
      parseDOM: [{ tag: 'note' }],
    },
    notegroup: {
      content: 'note+',
      toDOM() {
        return ['notegroup', 0];
      },
      parseDOM: [{ tag: 'notegroup' }],
    },
  },
});

/** 按住ctrl+space时会触发的命令，无论是否选中文字，尝试将当前所在note用notegroup包裹 */
const makeNoteGroup: Command = (state, dispatch) => {
  // Get a range around the selected blocks
  const range = state.selection.$from.blockRange(state.selection.$to);
  // See if it is possible to wrap that range in a note group
  const wrapping = findWrapping(range, noteSchema.nodes.notegroup);
  // If not, the command doesn't apply
  if (!wrapping) return false;
  // Otherwise, dispatch a transaction, using the `wrap` method to
  // create the step that does the actual wrapping.
  if (dispatch) {
    dispatch(state.tr.wrap(range, wrapping).scrollIntoView());
  }
  return true;
};

/**
 * 3个要点：star自定义node，shouting/link自定义mark
 */
const starSchema = new Schema({
  nodes: {
    doc: {
      content: 'block+',
    },
    text: {
      group: 'inline',
    },
    star: {
      inline: true,
      group: 'inline',
      toDOM() {
        return ['star', '🟊'];
      },
      parseDOM: [{ tag: 'star' }],
    },
    paragraph: {
      group: 'block',
      content: 'inline*',
      toDOM() {
        return ['p', 0];
      },
      parseDOM: [{ tag: 'p' }],
    },
    boring_paragraph: {
      group: 'block',
      content: 'text*',
      marks: '', // ❌ 禁止所有marks
      toDOM() {
        return ['p', { class: 'boring' }, 0];
      },
      parseDOM: [{ tag: 'p.boring', priority: 60 }],
    },
  },
  marks: {
    shouting: {
      // 类似strong/b，但不支持属性
      toDOM() {
        return ['shouting', 0];
      },
      parseDOM: [{ tag: 'shouting' }],
    },
    link: {
      attrs: { href: {} },
      toDOM(node) {
        return ['a', { href: node.attrs.href }, 0];
      },
      parseDOM: [
        {
          tag: 'a',
          getAttrs(dom) {
            return { href: dom instanceof HTMLAnchorElement ? dom.href : '' };
          },
        },
      ],
      inclusive: false, // 默认true，默认会继续mark格式
    },
  },
});

const toggleLink: Command = (state, dispatch) => {
  const { doc, selection } = state;
  if (selection.empty) return false;
  let attrs = null;
  if (!doc.rangeHasMark(selection.from, selection.to, starSchema.marks.link)) {
    attrs = { href: prompt('Link to where?', '') };
    if (!attrs.href) return false;
  }
  return toggleMark(starSchema.marks.link, attrs)(state, dispatch);
};

const insertStar: Command = (state, dispatch) => {
  const type = starSchema.nodes.star;
  const { $from } = state.selection;
  if (!$from.parent.canReplaceWith($from.index(), $from.index(), type))
    return false;
  dispatch(state.tr.replaceSelectionWith(type.create()));
  return true;
};

const starKeymap = keymap({
  'Ctrl-b': toggleMark(starSchema.marks.shouting),
  'Ctrl-q': toggleLink,
  'Ctrl-Space': insertStar,
});

/**
 * ✨ 官方编辑器示例，自定义schema 。
 * - https://prosemirror.net/examples/schema/
 *
 * - 👉🏻 本示例要点
 * - note作为block/block-group的示例，在编辑器dom内渲染了自定义html元素标签、css选择器
 * - 回车和退格能够复用官方keymap插件
 */
export const CustomSchemaBlockGroupLink = () => {
  const editorContainer = useRef<HTMLDivElement>();
  const editorContainerStarLink = useRef<HTMLDivElement>();
  const initialContentContainer = useRef<HTMLDivElement>();
  const initialContentStarLink = useRef<HTMLDivElement>();
  const view = useRef<EditorView>(null);
  const view2 = useRef<EditorView>(null);

  useEffect(() => {
    const state = EditorState.create({
      doc: DOMParser.fromSchema(noteSchema).parse(
        initialContentContainer.current,
      ),
      plugins: [
        keymap({ 'Ctrl-Space': makeNoteGroup }),
        keymap({ 'Mod-z': undo, 'Mod-y': redo }),
        keymap(baseKeymap),
        history(),
      ],
    });
    view.current = new EditorView(editorContainer.current, {
      state,
    });

    const state2 = EditorState.create({
      doc: DOMParser.fromSchema(starSchema).parse(
        initialContentStarLink.current,
      ),
      plugins: [
        starKeymap,
        keymap({ 'Mod-z': undo, 'Mod-y': redo }),
        keymap(baseKeymap),
        history(),
      ],
    });
    view2.current = new EditorView(editorContainerStarLink.current, {
      state: state2,
    });
    // applyDevTools(view.current, { devToolsExpanded: false });

    return () => {
      view.current.destroy();
      view2.current.destroy();
    };
  }, []);

  return (
    <StyledDemoContainer>
      <div ref={editorContainer} id='editor' />
      <p />
      <p />
      <div ref={editorContainerStarLink} id='editor2' />
      {/* 👇🏻 剩下的全是默认隐藏的编辑器初始数据 */}
      {/* <h3>block and block-group in ProseMirror</h3> */}
      <div ref={initialContentContainer} style={{ display: 'none' }}>
        <note>Do laundry</note>
        <note>Water the tomatoes</note>
        <notegroup>
          <note>Buy flour</note>
          <note>Get toilet paper</note>
        </notegroup>
      </div>
      {/* <h3>star and link in ProseMirror</h3> */}
      <div ref={initialContentStarLink} style={{ display: 'none' }}>
        <p>
          This is a <star />
          nice
          <star /> paragraph, it can have <shouting>anything</shouting> in it.
        </p>
        <p className='boring'>
          This paragraph is boring, it can't have anything.
        </p>
        <p>
          Press ctrl/cmd-space to insert a star, ctrl/cmd-b to toggle shouting,
          and ctrl/cmd-q to add or remove a link.
        </p>
      </div>
    </StyledDemoContainer>
  );
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'my-html-custom-tag': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      note: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      notegroup: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      star: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
      shouting: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

const StyledDemoContainer = styled(StyledProseMirrorCore)`
  note,
  notegroup {
    display: block;
    border: 1px solid silver;
    border-radius: 3px;
    padding: 3px 6px;
    margin: 5px 0;
  }
  notegroup {
    border-color: #66f;
  }
  p.boring {
    background: #eee;
    color: #444;
  }
  shouting {
    display: inline;
    text-transform: uppercase;
    font-weight: bold;
  }
  star {
    display: inline;
    font-size: 190%;
    line-height: 1;
    vertical-align: -10%;
    color: #a8f;
    -webkit-text-stroke: 1px #75b;
  }
`;
