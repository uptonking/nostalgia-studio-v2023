import './index.css';
import { io, type Socket } from 'socket.io-client';
import * as CodeMirror from 'codemirror';
import { CodeMirror5Adapter } from './codemirror5-adapter';
import { EditorClient } from './editor-client';
import { SocketIOAdapter } from './socketio-adapter';

const COLLAB_BASE_URL = 'http://localhost:4001';

const socket = io(COLLAB_BASE_URL);

const editorEle = document.querySelector('#note') as HTMLTextAreaElement;

socket.on('doc', (data: any) => {
  // 👇🏻 每次协作服务端发来新数据，都会替换codeMirror实例的value
  const cm5 = CodeMirror.fromTextArea(editorEle, { lineNumbers: true });
  cm5.setValue(data.str);
  const editorAdapter = new CodeMirror5Adapter(cm5);

  const serverAdapter = new SocketIOAdapter(socket);

  const client = new EditorClient(
    data.revision,
    data.clients,
    serverAdapter,
    editorAdapter,
  );

  window['cm'] = cm5;
});
