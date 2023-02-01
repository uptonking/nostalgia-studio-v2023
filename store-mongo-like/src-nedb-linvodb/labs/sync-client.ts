import WebSocket from 'ws';
import type { Model } from '../src';
import { EventEmitter } from '../src/utils/event-emitter';
import {
  createSync,
  decode,
  syncChangesTreeToTargetTree,
} from '../extensions/sync/sync';
import { createStore } from '../extensions/sync';

const socket = new WebSocket('ws://localhost:3000/sync/trie');

class LinvoDbAdapter extends EventEmitter {
  dbInstance: Model;
  /** 每次本地save或construct时，会添加到本Map */
  mtimes = {};

  isSyncing = false;

  sync: ReturnType<typeof createSync>;

  constructor(dbInstance: Model) {
    super();
    this.dbInstance = dbInstance;

    this.onStoreChanges = this.onStoreChanges.bind(this);

    // @ts-expect-error fix-types
    this.sync = createSync(dbInstance, 'storeLocal');
    // @ts-expect-error fix-types 本地store每次更新时会触发
    this.dbInstance.subscribe(() =>
      this.onStoreChanges(this.sync.getChanges()),
    );
    // model.on('updated', (items, quiet) => {
    //   if (!quiet) triggerSync();
    // });
    // model.on('inserted', (items, quiet) => {
    //   if (!quiet) triggerSync();
    // });
    // model.on('save', (x) => {
    //   if (x._id && x._mtime) this.mtimes[x._id] = x._mtime;
    // });
    // model.on('reset', () => {
    //   this.mtimes = {};
    // });
  }

  // onInsert(cb) {
  //   model.on('inserted', (items, quiet) => {
  //     if (!quiet) cb();
  //   });
  // }
  // onUpdate(cb) {
  //   model.on('updated', (items, quiet) => {
  //     if (!quiet) cb();
  //   });
  // }

  onStoreChanges(changes) {
    this.emit('op_change', changes);
  }

  receiveChanges(changes) {
    if (!changes) return;
    const fromTree = decode(changes);
    this.sync.getChanges();
    syncChangesTreeToTargetTree(fromTree, this.sync);
    // @ts-expect-error fix-types
    console.log(';; dbReceiveChanges ', this.dbInstance.getState());
  }

  mockChange() {
    this.sync.mockChange();
  }

  triggerSync() {
    if (this.isSyncing) return;
    // this.dbInstance.count({}, () => { });
  }
}

class ServerAdapter extends EventEmitter {
  socket: WebSocket;

  constructor(socket: WebSocket) {
    super();
    this.socket = socket;
    socket.addEventListener('message', ({ data }) => {
      // @ts-expect-error fix-types
      const msg = JSON.parse(data);
      console.log(';; ', msg);
      if (msg.type === 'cs_remote_changes') {
        console.log(';; cl remote_changes ', msg);
        this.emit('remote_changes', msg.content);
      }
    });
  }

  requestChangesMetedata() {
    this.socket.send(
      JSON.stringify({
        type: 'cs_remote_changes_metadata',
        content: 'trie',
      }),
    );
  }

  sendChanges(changes?: any) {
    this.socket.send(
      JSON.stringify({
        type: 'cs_send_changes',
        content: changes,
      }),
    );
  }
}

class SyncClient {
  serverAdapter: ServerAdapter;
  storeAdapter: LinvoDbAdapter;
  constructor({
    serverAdapter,
    storeAdapter,
  }: {
    serverAdapter: ServerAdapter;
    storeAdapter: LinvoDbAdapter;
  }) {
    this.serverAdapter = serverAdapter;
    this.storeAdapter = storeAdapter;

    this.onLocalChanges = this.onLocalChanges.bind(this);
    this.onRemoteChanges = this.onRemoteChanges.bind(this);

    this.storeAdapter.on('op_change', this.onLocalChanges);
    this.serverAdapter.on('remote_changes', this.onRemoteChanges);

    storeAdapter.mockChange();
    // setInterval(() => {
    //   storeAdapter.mockChange();
    // }, 20000);
  }

  syncChange = () => {
    // handleChange(change, hlc); // local trie
    // requestMeta;
    // pull;
    // push;
  };

  onLocalChanges(changes) {
    this.serverAdapter.sendChanges(changes);
  }
  onRemoteChanges(changes) {
    this.storeAdapter.receiveChanges(changes);
  }

  requestChangesMetadata(metedata) {
    this.serverAdapter.requestChangesMetedata();
  }
}

const store1 = createStore();

socket.addEventListener('open', () => {
  // send an opening message to the server
  socket.send(
    JSON.stringify({
      type: 'cs_open_client',
      content: 'clientId-' + Math.round(Math.random() * 50),
    }),
  );
});

socket.addEventListener('message', ({ data }) => {
  // @ts-expect-error fix-types
  const msg = JSON.parse(data);
  console.log(';; c-msg ', msg);

  if (msg.type === 'cs_init_connection') {
    // @ts-expect-error fix-types
    const linvoAdapter = new LinvoDbAdapter(store1);
    const serverAdapter = new ServerAdapter(socket);
    const syncClient = new SyncClient({
      storeAdapter: linvoAdapter,
      serverAdapter,
    });
  }
});
