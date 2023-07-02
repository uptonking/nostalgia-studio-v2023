import type ws from 'ws';
import { WebSocket, WebSocketServer, type ServerOptions } from 'ws';
import type http from 'node:http';
import cors from 'cors';
import express from 'express';
import {
  createSync,
  decode,
  syncChangesTreeToTargetTree,
  getDiff,
  encode,
} from '../extensions/sync/sync';
import { createStore } from '../extensions/sync';

const store = createStore();
// @ts-expect-error fix-types
const syncUtil = createSync(store, 'storeServer');

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
    wss: WebSocketServer = new WebSocketServer({
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

const wss = new WebSocketServer({
  clientTracking: true,
  noServer: true,
});

const wsBroadcast = (data, excludes = []) => {
  wss.clients.forEach((client) => {
    if (
      client.readyState === WebSocket.OPEN &&
      excludes.indexOf(client) === -1
    ) {
      client.send(data, { binary: false });
    }
  });
};

/**
 * common api for any sync server
 */
export interface SyncServerType {
  getChangesMetadata: (id: string) => { data: any };
  getChanges: (ids: string[]) => { data: any };
  receiveChanges: (ids: string[]) => { data: any };
}

export class WebSocketSyncServer implements SyncServerType {
  changesRootNode;
  changesContents = {};

  constructor() {}

  addClient(socket) {
    socket.send(
      JSON.stringify({
        type: 'css_init_connection',
        content: [1, '2'],
      }),
    );
    console.log(';; clients-size ', wss.clients.size);

    socket.on('message', (data) => {
      const msg = JSON.parse(data);
      console.log(';; csc-msg', msg);

      if (msg.type === 'csc_open_client') {
        console.log(';; open_client ', msg);
      }
      if (msg.type === 'csc_client_changes') {
        console.log(';; client_changes ');

        const fromTree = decode(msg.content || '');
        // console.log(';; fromTree ', fromTree);
        syncChangesTreeToTargetTree(fromTree, syncUtil);
        console.log(';; srvChangedTo ', store.getState());
        const currTrie = syncUtil.getChanges();
        console.log(';; currTrie ', currTrie);

        let remoteChanges = null;
        // if (!this.changesRootNode) {
        //   this.changesRootNode = changeTree;
        // } else {
        // const currTree = syncUtil.getChanges();
        // const diffChanges = getDiff(fromTree, currTree)
        // syncUtil.setChanges(diffChanges)
        // this.changesRootNode = msg.content;
        // }
        // remoteChanges = getDiff(syncUtil.getChangesTree(), fromTree);

        // socket.send(
        //   JSON.stringify({
        //     type: 'cs_remote_changes',
        //     content: encode(remoteChanges),
        //   }),
        // );

        wsBroadcast(
          JSON.stringify({
            type: 'css_remote_changes',
            content: currTrie,
          }),
        );
      }
    });
  }

  getChangesMetadata(id: string) {
    return { data: null };
  }

  getChanges(ids: string[]) {
    return { data: null };
  }

  receiveChanges(ids: string[]) {
    return { data: null };
  }
}

declare global {
  namespace Express {
    export interface Request {
      ws: () => Promise<ws>;
    }
  }
}

const syncServer = new WebSocketSyncServer();

const app = express();
app.use(cors());

app.use(
  '/sync/trie',
  tinyWs({ clientTracking: true }, wss),
  async (req, res) => {
    // console.log(';; req.ws ', req.ws);

    if (req.ws) {
      const ws = await req.ws();
      syncServer.addClient(ws);

      // return ws.send('hello from express@4');
    } else {
      res.send('HTTP request for /sync/trie');
    }
  },
);

app.listen(process.env.PORT || 3009);
