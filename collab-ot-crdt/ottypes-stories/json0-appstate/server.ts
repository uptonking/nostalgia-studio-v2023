import http from 'node:http';

import cors from 'cors';
import express from 'express';
import { type } from 'ot-json0';
import Websocket, { WebSocketServer } from 'ws';

const port = process.env.PORT || 4001;

const app = express();
app.use(cors());
app.set('port', port);

const httpServer = http.createServer(app);
const wss = new WebSocketServer({
  server: httpServer,
});

type AppDoc = {
  loc: string;
  title: string;
  ticker: number;
  content: string;
};

/** 全局文档内容，未持久化 */
let state: AppDoc = {
  loc: 'inbox',
  title: 'hi json0',
  ticker: 0,
  content: 'initial 初始内容',
};
/** 全局文档对应的版本 */
let version = 0;
/** 映射表，保存未被客户端ack的op，[version, op] */
const inflight: Record<number, any> = {};

wss.on('connection', function (client) {
  console.log('== client connected ', wss.clients.size);

  const send = (msg) => client.send(JSON.stringify(msg));
  const broadcast = (msg) => {
    wss.clients.forEach((client1) => {
      if (client1 !== client && client1.readyState === Websocket.OPEN) {
        client1.send(JSON.stringify(msg));
      }
    });
  };

  send({
    a: 'i',
    initial: state,
    v: version,
  });

  client.on('close', function () {
    return console.log('== client disconnected');
  });
  client.on('error', function (e) {
    return console.warn('Error in websocket client: ', e.stack);
  });

  client.on('message', function (data, isBinary) {
    console.log(';; on-msg-binary', isBinary, data);
    let op;
    let other;
    // @ts-expect-error
    const msg = JSON.parse(data);
    // 👇🏻 客户端向服务端发送的消息只有2种，op和ack
    switch (msg.a) {
      case 'op':
        // console.log('op', msg);
        try {
          op = msg.op;
          type.checkValidOp(op);
          let v = msg.v;
          while (v < version) {
            other = inflight[v];
            if (other == null) {
              console.error('Could not find server op ' + op.v);
              break;
            }
            // 👇🏻 得到的是转换后的op，注意被转发的不是原op了
            op = type.transform(op, other, 'right');
            v++;
          }
          state = type.apply(state, op);
          send({
            a: 'ack',
            v: version,
          });
          broadcast({
            a: 'op',
            v: version,
            op,
          });
          version++;
        } catch (_error) {
          console.error('Could not absorb op from client', op, _error);
        }
        break;
      case 'ack':
        delete inflight[msg.v];
    }
  });

  const submit = (op) => {
    type.checkValidOp(op);
    state = type.apply(state, op);
    inflight[version] = op;
    send({
      a: 'op',
      v: version,
      op: op,
    });
    return version++;
  };

  // 👉🏻 仅用于测试，每隔N秒向客户端发送一个op
  // let timer = setInterval(() => {
  //   submit([
  //     {
  //       p: ['ticker'],
  //       na: 1,
  //     },
  //     {
  //       p: ['content'],
  //       od: state.content,
  //       oi: 'Some <b>html</b> ' + Math.random(),
  //     },
  //   ]);
  // }, 2000);
});

httpServer.listen(port, () => {
  console.log('server is listening on http://localhost:' + port + '\n');
});
