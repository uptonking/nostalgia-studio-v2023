import WebSocket from 'ws';
import { type Model } from '../src';
import { EventEmitter } from '../src/utils/event-emitter';
import {
  createSync,
  decode,
  syncChangesTreeToTargetTree,
} from '../extensions/sync/sync';
import { createStore } from '../extensions/sync';

const COLLAB_SERVER = 'ws://localhost:3009';
const socket = new WebSocket(COLLAB_SERVER + '/sync/trie');

class LinvoDbAdapter extends EventEmitter {
  dbInstance: Model;
  /** 每次本地save或construct时，会添加到本Map */
  mtimes = {};

  isSyncing = false;

  syncUtil: ReturnType<typeof createSync>;

  constructor(dbInstance: Model) {
    super();
    this.dbInstance = dbInstance;

    this.onStoreChanges = this.onStoreChanges.bind(this);

    // @ts-expect-error fix-types
    this.syncUtil = createSync(dbInstance, 'storeLocal');
    // @ts-expect-error fix-types 本地store每次更新时会触发
    this.dbInstance.subscribe(() =>
      this.onStoreChanges(this.syncUtil.getChanges()),
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

  onStoreChanges(changes) {
    this.emit('local_changes', changes);
  }

  receiveChanges(changes) {
    if (!changes) return;
    const fromTree = decode(changes);
    this.syncUtil.getChanges();
    syncChangesTreeToTargetTree(fromTree, this.syncUtil);
    // @ts-expect-error fix-types
    console.log(';; dbReceiveChanges ', this.dbInstance.getState());
  }

  mockChange() {
    this.syncUtil.mockChange();
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
      console.log(';; css-msg ', msg);

      if (msg.type === 'css_remote_changes') {
        console.log(';; css remote_changes ');
        this.emit('remote_changes', msg.content);
      }
    });
  }

  requestChangesMetedata() {
    this.socket.send(
      JSON.stringify({
        type: 'csc_remote_changes_metadata',
        content: 'trie',
      }),
    );
  }

  sendChanges(changes?: any) {
    this.socket.send(
      JSON.stringify({
        type: 'csc_client_changes',
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

    this.storeAdapter.on('local_changes', this.onLocalChanges);
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
      type: 'csc_open_client',
      content: 'clientId-' + Math.round(Math.random() * 50),
    }),
  );
});

socket.addEventListener('message', ({ data }) => {
  // @ts-expect-error fix-types
  const msg = JSON.parse(data);
  // console.log(';; css-msg ', msg);

  if (msg.type === 'css_init_connection') {
    // @ts-expect-error fix-types
    const linvoAdapter = new LinvoDbAdapter(store1);
    const serverAdapter = new ServerAdapter(socket);
    const syncClient = new SyncClient({
      storeAdapter: linvoAdapter,
      serverAdapter,
    });
  }
});
