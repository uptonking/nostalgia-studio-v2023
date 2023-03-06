import {
  JSONPatch,
  syncable,
  type SyncableClient,
} from '@typewriter/json-patch';

type AppDoc = {
  title: string;
  ticker: number;
  content: string;
};

/** render state to dom */
const render = (state: AppDoc) => {
  const title = document.getElementById('title');
  title!.innerText = state.title;
  const number = document.getElementById('number');
  number!.innerText = String(state.ticker);
  const content = document.getElementById('content');
  if (state.content != null) {
    content!.innerHTML = state.content;
  }
};

const COLLAB_BASE_URL = 'localhost:4001';
const wsUrl = 'ws://' + COLLAB_BASE_URL;
const ws = new WebSocket(wsUrl);

/** global state object with syncable-ability */
let stateClient: SyncableClient<AppDoc>;

/** 收到服务端发来的消息，只有n种 */
ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  console.log(';; ws-data', msg);

  switch (msg.type) {
    case 'initial': {
      // /initial data
      stateClient = syncable(msg.data, msg.meta);
      window['state'] = stateClient;
      // Automatically send changes when changes happen.
      // This will be called immediately if there are outstanding changes needing to be sent.
      stateClient.subscribe((data, meta, hasUnsentChanges) => {
        if (hasUnsentChanges) {
          stateClient.send(async (patch) => {
            // A function you define using fetch, websockets, etc. Be sure to use await/promises to know when it is complete
            // or errored. Place the try/catch around send, not inside
            await ws.send(JSON.stringify({ type: 'patch', data: patch }));
          });
        }
      });
      render(stateClient.get());
      break;
    }
    case 'opAck': {
      const { patch, rev } = msg.data;
      stateClient.receive(patch, rev);
      render(stateClient.get());
      break;
    }
  }
};

ws.onopen = () => {
  console.log('connected');
};
ws.onclose = () => {
  console.log('disconnected');
};
ws.onerror = (err) => {
  console.error(err);
};

/** 用来模拟在本地客户端产生一个新op时触发的逻辑 */
const submit = (path, value) => {
  stateClient.change(new JSONPatch().add(path, value));
  render(stateClient.get());
};

// let counter = 1;
const mockSubmit = () => {
  // submit([
  //   {
  //     p: ['ticker'],
  //     na: 1,
  //   },
  //   {
  //     p: ['content'],
  //     od: state?.content,
  //     oi: 'Some <b>html</b> ' + Math.random(),
  //   },
  // ]);
};
const mockSubmit1 = () => {
  submit('/ticker', Math.floor(Math.random() * 100) + 1);
};
const mockSubmit2 = () => {
  submit('/content', Math.random());
};

document.querySelector('.idNewOp1')?.addEventListener('click', () => {
  mockSubmit1();
  // setInterval(() => mockSubmit1(), 2000);
});
document.querySelector('.idNewOp2')?.addEventListener('click', () => {
  mockSubmit2();
  // setInterval(() => mockSubmit2(), 2000);
});
