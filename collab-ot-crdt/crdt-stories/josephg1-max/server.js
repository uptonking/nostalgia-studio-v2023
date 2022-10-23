import * as crdt from './crdt.js';
import polka from 'polka';
import sirv from 'sirv';
import { WebSocketServer } from 'ws';
import http from 'http';
import fs from 'fs';
import path from 'path';

const dir = path.dirname(new URL(import.meta.url).pathname);
const app = polka().use(
  sirv(dir, {
    dev: true,
  }),
);

const DB_FILE = 'db1.json';

/** 服务端在内存操作的最新数据，在ws.onmessage里面持久化到服务端本地文件了 */
let db = (() => {
  try {
    const bytes = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(bytes);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;

    console.log('Using new database file');
    return crdt.create ? crdt.create() : {};
  }
})();

console.dir(db, { depth: null });

const clients = new Set();

const broadcastOp = (op, exclude) => {
  console.log('broadcast', op);

  for (const c of clients) {
    if (c !== exclude) {
      c.send(JSON.stringify(op));
    }
  }
};

const server = http.createServer(app.handler);
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log(';; ws-clients-num ', wss.clients.size);
  // console.dir(dt.toJSON(db), {depth: null})
  ws.send(JSON.stringify(db));
  clients.add(ws);

  // 👇🏻 每次收到op，先应用到服务端，再广播到非sender
  ws.on('message', (msgBytes) => {
    const rawJSON = msgBytes.toString('utf-8');
    const op = JSON.parse(rawJSON);
    console.log('got op', op);
    db = crdt.merge(db, op);
    broadcastOp(op, ws);

    const latestDoc = JSON.stringify(db, null, 2);
    return fs.writeFileSync(DB_FILE, latestDoc);
  });

  ws.on('close', () => {
    console.log('client closed');
    clients.delete(ws);
  });
});

server.listen(3001, () => {
  console.log('listening on port 3001');
});
