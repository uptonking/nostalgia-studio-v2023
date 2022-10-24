import { type } from 'ot-json0';

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

let state: AppDoc | null = null;
let version = 0;
/** 本地客户端一个新产生的op，初始状态是pending，然后可转换成inflight */
let pending = null;
/** 已发送到服务端，但未收到ack的op */
let inflight = null;

/** 收到服务端发来的消息，只有3种类型，init/ack/op */
ws.onmessage = (event) => {
  let op;
  const msg = JSON.parse(event.data);
  console.log(';; ws-data', msg);

  switch (msg.a) {
    case 'i': // initial data
      state = msg.initial;
      version = msg.v;
      state && render(state);
      break;
    case 'ack':
      version++;
      inflight = null;
      flush();
      break;
    case 'op':
      if (msg.v > version) {
        console.warn('Future operation ? msg.v/local.v ', msg.v, version);
        return;
      }
      op = msg.op;
      if (inflight) {
        [inflight, op] = type.transformX(inflight, op);
      }
      if (pending) {
        [pending, op] = type.transformX(pending, op);
      }
      version++;
      state = type.apply(state, op);
      state && render(state);
      ws.send(
        JSON.stringify({
          a: 'ack',
          v: msg.v,
        }),
      );
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

/** 发送op到服务端，将pending转为inflight，然后清空pending */
const flush = () => {
  if (inflight || !pending) {
    // 若已发送而等待ack，则不必；若不存在新op，则也不必
    return;
  }
  inflight = pending;
  pending = null;
  ws.send(
    JSON.stringify({
      a: 'op',
      op: inflight,
      v: version,
    }),
  );
};

/** 用来模拟在本地客户端产生一个新op时触发的逻辑 */
const submit = (op) => {
  type.checkValidOp(op);
  state = type.apply(state, op);
  if (pending) {
    pending = type.compose(pending, op);
  } else {
    pending = op;
  }

  // Allow other ops to be composed together during this event frame
  setTimeout(() => {
    flush();
  }, 0);

  state && render(state);
};

const mockSubmit = () => {
  submit([
    {
      p: ['ticker'],
      na: 1,
    },
    {
      p: ['content'],
      od: state?.content,
      oi: 'Some <b>html</b> ' + Math.random(),
    },
  ]);
};
const mockSubmit1 = () => {
  submit([
    {
      p: ['ticker'],
      na: 1,
    },
  ]);
};
const mockSubmit2 = () => {
  submit([
    {
      p: ['content'],
      od: state?.content,
      oi: 'Some <b>html</b> ' + Math.random().toString(36).slice(-2),
    },
  ]);
};

document.querySelector('.idNewOp1')?.addEventListener('click', () => {
  // mockSubmit1();
  setInterval(() => mockSubmit1(), 2000);
});
document.querySelector('.idNewOp2')?.addEventListener('click', () => {
  // mockSubmit2();
  setInterval(() => mockSubmit2(), 2000);
});
