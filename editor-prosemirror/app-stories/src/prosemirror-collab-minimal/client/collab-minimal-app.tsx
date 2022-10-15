import {
  collab,
  getVersion,
  receiveTransaction,
  sendableSteps,
} from 'prosemirror-collab';
import { exampleSetup } from 'prosemirror-example-setup';
import { DOMParser, Schema, type Node } from 'prosemirror-model';
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import React, { useEffect } from 'react';
import { io, type Socket } from 'socket.io-client';
import type { Step } from 'prosemirror-transform';

import { Authority } from './central-authority';
import { StyledContainer } from '../../stories/examples-docs/editor-examples.styles';

const API_BASE_URL = 'http://127.0.0.1:4001';

/**
 * 创建editorState和editorView，并在dispatchTr方法中发送socket编辑操作消息
 */
function collabEditor(
  authority: Authority,
  place: Element,
  docSchema: Schema,
  socket: Socket,
) {
  const examplePlugins = exampleSetup({ schema: docSchema });
  // takes care of tracking local changes, receiving remote changes, and indicating when something has to be sent to central authority.
  const collabPlugin = collab({ version: authority.steps.length });
  const state = EditorState.create({
    doc: authority.doc,
    plugins: [...examplePlugins, collabPlugin],
  });
  const view = new EditorView(place, {
    state,
    dispatchTransaction(transaction) {
      const newState = view.state.apply(transaction);
      view.updateState(newState);
      // 从newState中计算需要发送到服务端的新steps
      const sendable = sendableSteps(newState);
      if (sendable) {
        const newDoc = authority.receiveSteps(
          sendable.version,
          sendable.steps,
          sendable.clientID,
        );
        if (newDoc) {
          socket.emit('update', {
            doc: newDoc,
            clientId: sendable.clientID,
            version: sendable.version,
            steps: sendable.steps,
          });
        }
      }
    },
  });
  // 每次有新steps，都会tr创建更新当前editorView
  authority.onNewSteps.push(function updateEditorViewWithNewSteps() {
    const newData = authority.stepsSince(getVersion(view.state));
    view.dispatch(
      receiveTransaction(view.state, newData.steps, newData.clientIDs),
    );
  });
  return view;
}

/**
 * ✨️ 基于socket.io实现协作编辑
 * - 基于官方文档实现的最精简示例
 */
export function PMCollabMinimalApp() {
  useEffect(() => {
    const socket = io(API_BASE_URL);

    const mySchema = new Schema({
      nodes: addListNodes(schema.spec.nodes, 'paragraph block*', 'block'),
      marks: schema.spec.marks,
    });

    let myAuthority: any;
    socket.emit('hello');

    // 👇🏻️ 在socket连接的init事件后，才会创建EditorView
    socket.on('init', (data) => {
      if (!window.view) {
        const doc = data
          ? mySchema.nodeFromJSON(data)
          : DOMParser.fromSchema(mySchema).parse(
              document.querySelector('#content'),
            );
        myAuthority = new Authority(doc);
        const place = document.querySelector('#editor');
        const myView = collabEditor(myAuthority, place, mySchema, socket);
        window.view = myView;
      }
    });

    // 👇🏻️ 每次服务端触发updateDoc后，都会直接重新创建editorState对象，而不是通过tr创建eState
    socket.on('updateDoc', (data) => {
      const examplePlugins = exampleSetup({ schema: mySchema });
      const doc = mySchema.nodeFromJSON(data.doc);
      myAuthority.doc = doc;
      const newState = EditorState.create({
        doc: doc,
        plugins: [
          ...examplePlugins,
          collab({ version: myAuthority.steps.length }),
        ],
      });
      window.view.updateState(newState);
    });

    return () => {
      if (socket) socket.disconnect();
      if (window.view) {
        window.view.destroy();
        window.view = undefined;
      }
    };
  }, []);

  return (
    <StyledContainer className='App'>
      <div id='editor' />
      <div id='content' />
    </StyledContainer>
  );
}

declare global {
  interface Window {
    view: EditorView;
  }
}
