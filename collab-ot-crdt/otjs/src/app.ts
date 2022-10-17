import './index.css';
import 'codemirror/lib/codemirror.css';
import { io, type Socket } from 'socket.io-client';
import * as CodeMirror from 'codemirror';
import { CodeMirror5Adapter } from './codemirror5-adapter';
import { EditorClient } from './editor-client';
import { SocketIOAdapter } from './socketio-adapter';

const COLLAB_BASE_URL = 'http://localhost:4001';

const socket = io(COLLAB_BASE_URL);

const editorEle = document.querySelector('#note') as HTMLTextAreaElement;

socket.on('doc', (data: any) => {
  // 👇🏻 待优化，每次协作服务端发来新数据，都会替换codeMirror实例，试试只更新属性而不是替换实例
  const cm5 = CodeMirror.fromTextArea(editorEle, { lineNumbers: true });
  cm5.setValue(data.str);
  // 对codeMirror实例注册事件函数
  const editorAdapter = new CodeMirror5Adapter(cm5);

  const serverAdapter = new SocketIOAdapter(socket);

  // 注册callbacks到editorAdapter和serverAdapter
  const client = new EditorClient(
    data.revision,
    data.clients,
    serverAdapter,
    editorAdapter,
  );

  // 监听实时 canUndo/canRedo 变化
  // this.client.on('undoStatesChanged', this.trigger.bind(this, 'undoStatesChanged'))
  // 监听协同用户变化
  // this.client.on('clientsChanged', this.trigger.bind(this, 'clientsChanged'))

  window['cm'] = cm5;
});
