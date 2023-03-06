import http from 'node:http';

import cors from 'cors';
import express from 'express';
import Websocket, { WebSocketServer } from 'ws';

import { syncable } from '@typewriter/json-patch';

const port = process.env.PORT || 4001;

const app = express();
app.use(cors());
app.set('port', port);

const httpServer = http.createServer(app);
const wss = new WebSocketServer({
  server: httpServer,
});

/** 全局文档内容，未持久化 */
const state = {
  loc: 'inbox',
  title: 'hi json0',
  ticker: 0,
  content: 'initial 初始内容',
};

/** 全局数据json */
const stateClient = syncable(state, undefined, { server: true });

wss.on('connection', (client) => {
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
    type: 'initial',
    data: stateClient.get(),
    meta: stateClient.getMeta(),
  });

  client.on('message', function (data, isBinary) {
    // @ts-ignore
    const msg = JSON.parse(data);
    console.log(';; on-msg-binary', isBinary, msg);
    // 👇🏻 响应客户端向服务端发送的消息

    if (msg.type === 'patch') {
      const [returnPatch, rev, broadcastPatch] = stateClient.receive(msg.data);
      // console.log(';; latestObj ', stateClient.get());
      // console.log(';; meta ', stateClient.getRev(),stateClient.changesSince('0'));
      send({ type: 'opAck', data: { patch: returnPatch, rev } });
      broadcast({ type: 'opAck', data: { patch: broadcastPatch, rev } });
    }
  });

  client.on('close', function () {
    return console.log('== client disconnected');
  });
  client.on('error', function (e) {
    return console.warn('Error in websocket client: ', e.stack);
  });

  // 👉🏻 仅用于测试，每隔N秒向客户端发送一个op
  // let timer = setInterval(() => {
  //   //
  // }, 2000);
});

httpServer.listen(port, () => {
  console.log('server is listening on http://localhost:' + port + '\n');
});
