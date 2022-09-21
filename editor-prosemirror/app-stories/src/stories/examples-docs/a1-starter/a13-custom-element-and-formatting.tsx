/* eslint-disable react/no-unknown-property */
import { applyDevTools } from 'prosemirror-dev-toolkit';
import { buildMenuItems, exampleSetup } from 'prosemirror-example-setup';
import { MenuItem } from 'prosemirror-menu';
import { DOMParser, NodeSpec, NodeType, Schema } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { Command, EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

import { StyledContainer } from '../editor-examples.styles';

const notionLikeApps = [
  'notion',
  'outline',
  'miro',
  'clickup',
  'confluence',
] as const;

const notionLikeNodeSpec: NodeSpec = {
  group: 'inline',
  inline: true,
  attrs: {
    type: { default: 'notion' },
  },
  draggable: true,
  toDOM: (node) => {
    return [
      'img',
      {
        'notion-like-type': node.attrs.type,
        src: `/img/notion-like/${node.attrs.type}.png`,
        title: node.attrs.type,
        class: 'notion-like',
      },
    ];
  },
  parseDOM: [
    {
      tag: 'img[notion-like-type]',
      getAttrs: (dom) => {
        if (dom instanceof HTMLElement) {
          const type = dom.getAttribute('notion-like-type');
          return notionLikeApps.includes(type as typeof notionLikeApps[number])
            ? { type }
            : false;
        }
        return false;
      },
    },
  ],
};

const notionLikeSchema = new Schema({
  nodes: schema.spec.nodes.addBefore('image', 'notion', notionLikeNodeSpec),
  marks: schema.spec.marks,
});

function insertNotionLikeAppIconCmd(type: typeof notionLikeApps[number]) {
  const resultCmd: Command = (state, dispatch) => {
    const { $from } = state.selection;
    const index = $from.index();
    if (
      !$from.parent.canReplaceWith(index, index, notionLikeSchema.nodes.notion)
    ) {
      return false;
    }
    if (dispatch) {
      dispatch(
        state.tr.replaceSelectionWith(
          notionLikeSchema.nodes.notion.create({ type }),
        ),
      );
    }

    return true;
  };
  return resultCmd;
}

const menu = buildMenuItems(notionLikeSchema);
notionLikeApps.forEach((name) =>
  menu.insertMenu.content.push(
    new MenuItem({
      title: '插入 ' + name,
      label: name.charAt(0).toUpperCase() + name.slice(1),
      enable: (state) => insertNotionLikeAppIconCmd(name)(state),
      run: insertNotionLikeAppIconCmd(name),
    }),
  ),
);

/**
 * ✨ 官方编辑器示例，自定义Node/元素 。
 * - https://prosemirror.net/examples/dino/
 *
 * - ❓ 编辑器的宽度由内容的最大宽度决定；当每行内容都很短时，编辑器宽度就显得很窄
 * - 此时dom元素的属性名可能包括`toDOM`生成的非标准属性
 */
export const CustomElementEditor = () => {
  const editorContainer = useRef<HTMLDivElement>();
  const initialContentContainer = useRef<HTMLDivElement>();
  const view = useRef<EditorView>(null);

  useEffect(() => {
    const state = EditorState.create({
      doc: DOMParser.fromSchema(notionLikeSchema).parse(
        initialContentContainer.current,
      ),
      plugins: exampleSetup({
        schema: notionLikeSchema,
        menuContent: menu.fullMenu as MenuItem[][],
      }),
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
        <h3>Custom Element in ProseMirror</h3>

        <p>
          This is your custom notion-enabled editor. The insert menu allows you
          to insert notion-like-images.
        </p>
        <p>
          This paragraph
          <img className='notion-like' notion-like-type='notion' />, for
          example,
          <img className='notion-like' notion-like-type='miro' />
          is full <img className='notion-like' notion-like-type='outline' /> of
          custom notion-like images.
        </p>
        <p>
          Notion-like images nodes can be selected, copied, pasted, dragged, and
          so on.
        </p>
        {/* 👇🏻 若让下一行生效，因为内容变宽了，编辑器宽度就会增加 */}
        {/* <p>
          ProseMirror allows you to define your own schemas, which includes
          defining custom document elements. You can use whatever you put in the
          schema as proper semantic element in your documents.
        </p> */}
      </div>
    </StyledDemoContainer>
  );
};

const StyledDemoContainer = styled(StyledContainer)`
  img.notion-like {
    height: 40px;
    vertical-align: bottom;
    border: 1px solid #0ae;
    border-radius: 4px;
    background: #ddf6ff;
  }
`;
