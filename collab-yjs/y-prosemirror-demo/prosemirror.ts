import { exampleSetup } from 'prosemirror-example-setup';
import { keymap } from 'prosemirror-keymap';
import { EditorState } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import {
  redo,
  undo,
  yCursorPlugin,
  ySyncPlugin,
  yUndoPlugin,
} from 'y-prosemirror';
import { WebrtcProvider } from 'y-webrtc';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

import { schema } from './schema';

// /本文件全部逻辑都是注册load回调函数，里面包含初始化逻辑

window.addEventListener('load', () => {
  const ydoc = new Y.Doc();
  const provider = new WebrtcProvider('prosemirror-debug', ydoc);
  // const provider = new WebsocketProvider(
  //   'wss://demos.yjs.dev',
  //   'prosemirror-demo',
  //   ydoc,
  // );

  const yXmlFragment = ydoc.getXmlFragment('prosemirror');

  const editorContainer = document.createElement('div');
  const editorEle = document.createElement('div');
  editorEle.setAttribute('id', 'editor');
  editorContainer.insertBefore(editorEle, null);

  const prosemirrorView = new EditorView(editorEle, {
    state: EditorState.create({
      schema,
      plugins: [
        ySyncPlugin(yXmlFragment),
        yCursorPlugin(provider.awareness),
        yUndoPlugin(),
        keymap({
          'Mod-z': undo,
          'Mod-y': redo,
          'Mod-Shift-z': redo,
        }),
      ].concat(exampleSetup({ schema })),
    }),
  });
  document.body.insertBefore(editorContainer, null);

  const connectBtn = document.getElementById('y-connect-btn');
  connectBtn?.addEventListener('click', () => {
    if (provider.shouldConnect) {
      provider.disconnect();
      connectBtn.textContent = 'Connect';
    } else {
      provider.connect();
      connectBtn.textContent = 'Disconnect';
    }
  });

  window['example'] = { provider, ydoc, yXmlFragment, prosemirrorView };
});
