import { type } from 'ot-json0';

const render = (state) => {
  const title = document.getElementById('title');
  title!.innerText = state.title;
  const div = document.getElementById('number');
  div!.innerText = state.ticker;
  const content = document.getElementById('content');
  if (state.content != null) {
    return (div!.innerHTML = state.content);
  }
};

const flush = () => {
  if (inflight || pending == null) {
    return;
  }
  inflight = pending;
  pending = null;
  return ws.send(
    JSON.stringify({
      a: 'op',
      op: inflight,
      v: version,
    }),
  );
};

const ws = new WebSocket(
  'ws://' + window.location.host + window.location.pathname,
);

ws.onerror = function (err) {
  return console.error(err);
};

let state = null;
let version = 0;
let pending = null;
let inflight = null;

ws.onmessage = function (msg: any) {
  let op;
  let _ref;
  let _ref1;
  msg = JSON.parse(msg.data);
  console.log('websocket msg', msg);
  switch (msg.a) {
    case 'i':
      state = msg.initial;
      return render(state);
    case 'ack':
      version++;
      inflight = null;
      return flush();
    case 'op':
      if (msg.v > version) {
        console.warn('Future operation !?');
        return;
      }
      op = msg.op;
      if (inflight) {
        (_ref = type.transformX(inflight, op)),
          (inflight = _ref[0]),
          (op = _ref[1]);
      }
      if (pending) {
        (_ref1 = type.transformX(pending, op)),
          (pending = _ref1[0]),
          (op = _ref1[1]);
      }
      version++;
      state = type.apply(state, op);
      render(state);
      return ws.send(
        JSON.stringify({
          a: 'ack',
          v: msg.v,
        }),
      );
  }
};

ws.onopen = function () {
  return console.log('connected');
};

// const submit = (op) => {
//   type.checkValidOp(op);
//   state = type.apply(state, op);
//   if (pending) {
//     pending = type.compose(pending, op);
//   } else {
//     pending = op;
//   }
//   setTimeout(function () {
//     return flush();
//   }, 0);
//   return render(state);
// };
