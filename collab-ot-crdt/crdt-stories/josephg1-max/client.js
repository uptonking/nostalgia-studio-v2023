import * as crdt from './crdt.js';

let db = crdt.create ? crdt.create() : {};

let ws = null;

/** 仅初始化ws连接、减号、加号3处调用 */
const send = (msg) => {
  if (ws != null && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
};

const valueElem = document.getElementById('value');
const decrButton = document.getElementById('decrement');
const incrButton = document.getElementById('increment');

/** 简单更新dom， `valueElem.textContent = db;` */
const rerender = () => {
  valueElem.textContent = db;
};

/** 👇🏻 每次点击按钮会发送整个数据，而不是op */
incrButton.onclick = () => {
  db = crdt.merge(db, db + 1);
  send(db);
  rerender();
};

/**
 * ❓ 点击减号时，减号逻辑需要调整
 * - 客户端的merge计算应该取小值；
 * - 此时服务端的merge也要修改，否则一个用户减，另一个不变
 */
decrButton.onclick = () => {
  // db = crdt.merge(db, db - 1);
  db = crdt.merge(db, db - 1);
  console.log(';; 点击减号 ', db);
  send(db);
  rerender();
};

const startConnect = () => {
  const loc = window.location;
  const url =
    (loc.protocol === 'https:' ? 'wss://' : 'ws://') +
    loc.host +
    loc.pathname +
    'ws';
  ws = new WebSocket(url);
  ws.onopen = (e) => {
    console.log(';; ws-open', e);
    // send(db);
  };

  /** 每次收到服务端消息都会更新dom */
  ws.onmessage = (e) => {
    const op = JSON.parse(e.data);
    console.log('msg', op);
    db = crdt.merge(db, op);
    rerender();
  };

  ws.onclose = (e) => {
    console.log(';; ws-closed', e);
    ws = null;
    setTimeout(() => {
      startConnect();
    }, 3000);
  };

  ws.onerror = (e) => {
    console.error('WS error', e);
  };
};

startConnect();
