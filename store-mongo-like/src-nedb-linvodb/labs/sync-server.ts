import ws, { WebSocketServer, type ServerOptions } from 'ws';
import http from 'node:http';
import cors from 'cors';
import express from 'express';

export interface TinyWSRequest extends http.IncomingMessage {
  ws: () => Promise<ws>;
}

/**
 * tinyWs - adds `req.ws` method that resolves when websocket request appears
 * @param wsOptions
 */
export const tinyWs =
  (
    wsOptions?: ServerOptions,
    wss: InstanceType<typeof WebSocketServer> = new WebSocketServer({
      ...wsOptions,
      noServer: true,
    }),
  ) =>
    async (req: TinyWSRequest, _: unknown, next: () => void | Promise<void>) => {
      const upgradeHeader = (req.headers.upgrade || '')
        .split(',')
        .map((s) => s.trim());

      // When upgrade header contains "websocket" it's index is 0
      if (upgradeHeader.indexOf('websocket') === 0) {
        // console.log(';; header ', upgradeHeader);
        req.ws = () =>
          new Promise((resolve) => {
            wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
              wss.emit('connection', ws, req);
              resolve(ws);
            });
          });
      }

      await next();
    };

interface SyncServerI {
  getMetadata: (id: string) => { data: any };
  getOpLogs: (ids: string[]) => { data: any };
  receiveOpLogs: (ids: string[]) => { data: any };
}

class SyncServer implements SyncServerI {
  changesRootNode = {};
  changesOpLogs = {};

  constructor() { }

  addClient(socket) {
    socket.send(
      JSON.stringify({
        type: 'hello from server',
        content: [1, '2'],
      }),
    );

    socket.on('message', (data) => {
      const d = JSON.parse(data);
      console.log(';; ', d);
    });
  }

  getMetadata(id: string) {
    return { data: null };
  }

  getOpLogs(ids: string[]) {
    return { data: null };
  }

  receiveOpLogs(ids: string[]) {
    return { data: null };
  }

  startServer() { }
}

declare global {
  namespace Express {
    export interface Request {
      ws: () => Promise<ws>;
    }
  }
}

const syncServer = new SyncServer();

const app = express();
app.use(cors());

app.use('/sync/trie', tinyWs(), async (req, res) => {
  console.log(';; req.ws ', req.ws);

  if (req.ws) {
    const ws = await req.ws();
    syncServer.addClient(ws);

    // return ws.send('hello from express@4');
  } else {
    res.send('Hello from HTTP!');
  }
});

app.listen(process.env.PORT || 3000);
