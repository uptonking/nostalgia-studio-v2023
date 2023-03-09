import * as ace from 'ace-builds/src-noconflict/ace';
import { io, type Socket } from 'socket.io-client';

import { ACERgaAdapter } from './ace-rga-text';

const API_BASE_URL = 'http://127.0.0.1:3000';
const socket = io(API_BASE_URL);
// const socket = new WebSocket('ws://127.0.0.1:3000');

const editor = ace.edit('editor');

let client: ACERgaAdapter;

socket.on('init', ({ id, history }) => {
  if (!client) {
    editor.setWrapBehavioursEnabled(false);
    client = new ACERgaAdapter(id, editor);
    window['doc'] = client.rga;

    client.subscribe((op) => {
      console.log(';; op-send ', op);
      socket.emit('message', op);
    });

    socket.on('message', (op) => {
      console.log(';; op-recv ', op);
      client.receive(op);
    });

    socket.emit('message', { type: 'historyRequest' });
  }

  editor.focus();
});



// socket.onmessage = (e) => {
//   const data = JSON.parse(e.data);

//   console.log(';; op-recv ', data);

//   if (data.type === 'init') {
//     if (!client) {
//       editor.setWrapBehavioursEnabled(false);
//       client = new ACERgaAdapter(data.id, editor);

//       client.subscribe((op) => {
//         console.log(';; op-send ', op);
//         socket.send(JSON.stringify({ type: 'message', op }));
//       });

//       socket.send(
//         JSON.stringify({ type: 'message', op: { type: 'historyRequest' } }),
//       );
//     }

//     editor.focus();
//   }

//   if (data.type === 'message') {
//     // console.log(';; op-recv ', op)
//     client.receive(data.op);
//   }
// };

