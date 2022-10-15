import './index.css';
import { io, type Socket } from 'socket.io-client';
import * as CodeMirror from 'codemirror';
import { CodeMirror5Adapter } from './codemirror5-adapter';

const socket = io();

socket.on('doc', (data: any) => {
  const editorEle = document.querySelector('#note') as HTMLTextAreaElement;
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
