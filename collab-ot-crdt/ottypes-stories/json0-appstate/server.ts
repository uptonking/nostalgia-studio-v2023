import express from 'express';
import http from 'node:http';
import repl from 'node:repl';
import { type } from 'ot-json0';
import { WebSocketServer } from 'ws';

const app = express();
// app.use(express["static"]("" + __dirname));

const httpServer = http.createServer(app);
const wss = new WebSocketServer({
  server: httpServer,
});

const replSrv = repl.start({
  useGlobal: true,
});

replSrv.context.wss = wss;

wss.on('connection', function (client) {
  let inflight;
  let send;
  let state;
  let submit;
  let timer;
  let version;
  console.warn('client connected');
  state = {
    loc: 'inbox',
    title: 'oh hi',
    ticker: 0,
    content: '',
  };

  version = 0;
  inflight = {};
  send = (msg) => client.send(JSON.stringify(msg));

  send({
    a: 'i',
    initial: state,
  });

  client.on('close', function () {
    return console.warn('client went away');
  });
  client.on('error', function (e) {
    return console.warn('Error in websocket client: ', e.stack);
  });

  client.on('message', function (msg: any) {
    let e;
    let op;
    let other;
    let v;
    msg = JSON.parse(msg);
    console.warn('message from client', msg);
    switch (msg.a) {
      case 'op':
        console.warn('op', msg);
        try {
          op = msg.op;
          type.checkValidOp(op);
          v = msg.v;
          while (v < version) {
            other = inflight[v];
            if (other == null) {
              console.error('Could not find server op ' + op.v);
              break;
            }
            op = type.transform(op, other, 'right');
            v++;
          }
          state = type.apply(state, op);
          send({
            a: 'ack',
            v: version,
          });
          return version++;
        } catch (_error) {
          e = _error;
          return console.error('Could not absorb op frmo client', op, e);
        }
        break;
      case 'ack':
        return delete inflight[msg.v];
    }
  });

  submit = function (op) {
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

  timer = setInterval(function () {
    return submit([
      {
        p: ['ticker'],
        na: 1,
      },
      {
        p: ['content'],
        od: state.content,
        oi: 'Some <b>html</b> ' + Math.random(),
      },
    ]);
  }, 1000);

  replSrv.context.client = client;
  replSrv.context.submit = submit;
  replSrv.context.state = state;
  replSrv.context.version = version;
  replSrv.context.inflight = inflight;
  return (replSrv.context.send = send);
});

const port = 8222;

httpServer.listen(port);

console.warn('server is listening on http://localhost: ' + port + '\n');

replSrv.once('exit', function () {
  return httpServer.close();
});
