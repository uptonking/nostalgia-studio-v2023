// console.log(';;sync ', window && window['Timestamp']);

// 首次执行时，会初始化本地全局_clock对象
window.setClock(makeClock(new window.Timestamp(0, 0, makeClientId())));

/** applyMessages方法体中在本地执行完op后会执行的回调，由外部注册 */
let _onSync = null;
let _syncEnabled = true;

function setSyncingEnabled(flag) {
  _syncEnabled = flag;
}

/** 通过fetch发送post请求 */
async function post(data) {
  // let res = await fetch('https://crdt.jlongster.com/server/sync', {
  let res = await fetch('http://localhost:8006/sync', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  res = await res.json();

  if (res.status !== 'ok') {
    throw new Error('API error: ' + res.reason);
  }
  return res.data;
}

/**
 * Apply the data operation contained in a message to our local data store
 * (i.e., set a new property value for a secified dataset/table/row/column).
 * - 根据op-msg，更新全局数据`_data`
 * - 对于ui上的crud操作，create对应这里的push，update/delete对应属性赋值
 */
function apply(msg) {
  const table = _data[msg.dataset]; // 旧数据
  if (!table) {
    throw new Error('Unknown dataset: ' + msg.dataset);
  }

  const row = table.find((row) => row.id === msg.row);
  if (!row) {
    table.push({ id: msg.row, [msg.column]: msg.value });
  } else {
    row[msg.column] = msg.value;
  }
}

/**
 * For an incoming array of messages, build a Map where each key is an
 * _incoming_ message for a specific field (i.e., dataset + row + column) and
 * the value is the most recent _local_ message for that same field (if one
 * exists). If none exists, it will map to `undefined`.
 * @param {Object[]} incomingMessages
 */
function mapIncomingToLocalMessagesForField(incomingMessages) {
  /** 最后返回的map，{ 参数msg: 本地key同名的msg } */
  const incomingFieldMsgToLocalFieldMsgMap = new Map();

  // We are going to be searching for the _most recent_ local message for
  // specific fields, so we'll want to sort the local messages by timestamp
  // first.
  const sortedLocalMessages = [..._messages].sort((m1, m2) => {
    if (m1.timestamp < m2.timestamp) {
      // 👇🏻 注意是这里是降序排列，时间最大的在最前面
      return 1;
    } else if (m1.timestamp > m2.timestamp) {
      return -1;
    }
    return 0;
  });

  incomingMessages.forEach((incomingMsg) => {
    // Attempt to find the most recent local message for the same field as the
    // current incoming message (note that find() can return `undefined` if no
    // match is found).
    const mostRecentLocalMsg = sortedLocalMessages.find(
      (localMsg) =>
        incomingMsg.dataset === localMsg.dataset &&
        incomingMsg.row === localMsg.row &&
        incomingMsg.column === localMsg.column,
    );

    // Note that the incoming message OBJECT is being used as a key here
    // (something you couldn't do if an Object were used instead of a Map)
    incomingFieldMsgToLocalFieldMsgMap.set(incomingMsg, mostRecentLocalMsg);
  });

  return incomingFieldMsgToLocalFieldMsgMap;
}

/** 根据hlc执行lww-crdt更新本地数据，
 * - 然后将实参incomingMessages保存到本地全局_messages，并更新merkle，
 * - 然后执行注册过的onSync，本例中是执行render方法+显示同步成功的消息
 * @param {Object[]} incomingMessages
 */
function applyMessages(incomingMessages) {
  const incomingToLocalMsgsForField =
    mapIncomingToLocalMessagesForField(incomingMessages);
  const clock = getClock();

  // Look at each incoming message. If it's new to us (i.e., we don't have it in
  // our local store), or is newer than the message we have for the same field
  // (i.e., dataset + row + column), then apply it to our local data store and
  // insert it into our local collection of messages and merkle tree (which is
  // basically a specialized index of those messages).
  incomingMessages.forEach((incomingMsgForField) => {
    // `incomingToLocalMsgsForField` is a Map instance, which means objects
    // can be used as keys. If this is the first time we've encountered the
    // message, then we won't have a _local_ version in the Map and `.get()`
    // will return `undefined`.
    const mostRecentLocalMsgForField =
      incomingToLocalMsgsForField.get(incomingMsgForField);

    // If there is no corresponding local message (i.e., this is a "new" /
    // unknown incoming message), OR the incoming message is "newer" than the
    // one we have, apply the incoming message to our local data store.
    //
    // Note that although `.timestamp` references an object (i.e., an instance
    // of Timestamp), the JS engine is going to implicitly call the instance's
    // `.valueOf()` method when doing these comparisons. The Timestamp class has
    // a custom implementation of valueOf() that returns a string. So, in effect,
    // comparing timestamps below is comparing the toString() value of the
    // Timestamp objects.
    if (
      !mostRecentLocalMsgForField ||
      mostRecentLocalMsgForField.timestamp < incomingMsgForField.timestamp
    ) {
      // `apply()` means that we're going to actually update our local data
      // store with the operation contained in the message.
      apply(incomingMsgForField);
    }

    // If this is a new message that we don't have locally (i.e., we didn't find
    // a corresponding local message for the same dataset/row/column OR we did
    // but it has a different timestamp than ours), we need to add it to our
    // array of local messages and update the merkle tree.
    if (
      !mostRecentLocalMsgForField ||
      mostRecentLocalMsgForField.timestamp !== incomingMsgForField.timestamp
    ) {
      clock.merkle = merkle.insert(
        clock.merkle,
        Timestamp.parse(incomingMsgForField.timestamp),
      );

      // Add the message to our collection...
      _messages.push(incomingMsgForField);
    }
  });

  _onSync && _onSync();
}

/** 先在本地执行msg，再基于post广播消息
 * @param {Object[]} messages
 */
function sendMessages(messages) {
  applyMessages(messages);
  // 若post返回了新msg，applyMsg
  sync(messages);
}

/** Timestamp.recv + 执行 applyMessages */
function receiveMessages(messages) {
  messages.forEach((msg) =>
    Timestamp.recv(getClock(), Timestamp.parse(msg.timestamp)),
  );

  applyMessages(messages);
}

/** 暴露给外部注册 */
function onSync(func) {
  _onSync = func;
}

/** 通过post请求发送msg到服务端，若返回了新msg，则执行receiveMessages > applyMsg */
async function sync(initialMessages = [], since = null) {
  if (!_syncEnabled) {
    return;
  }

  let messages = initialMessages;

  if (since) {
    const timestamp = new Timestamp(since, 0, '0').toString();
    messages = _messages.filter((msg) => msg.timestamp >= timestamp);
  }

  let result;
  try {
    result = await post({
      group_id: 'my-group',
      client_id: getClock().timestamp.node(),
      messages,

      // Post our entire merkle tree. At a high level, this is a data structure
      // that makes it easy to see which messages we (the client) know about
      // for given timestamps. The other node (server) will use this to quickly
      // figure out which messages it has that we do not have.
      merkle: getClock().merkle,
    });
  } catch (e) {
    throw new Error('network-failure');
  }

  console.log(';; fetch-ops ', result.messages, result);
  if (result.messages.length > 0) {
    receiveMessages(result.messages);
  }

  const diffTime = merkle.diff(result.merkle, getClock().merkle);

  if (diffTime) {
    if (since && since === diffTime) {
      const errMsg = `since === diffTime: ${diffTime}; `;
      throw new Error(
        errMsg +
        'A bug happened while syncing and the client ' +
        'was unable to get in sync with the server. ' +
        "This is an internal error that shouldn't happen",
      );
    }

    return sync([], diffTime);
  }
}

window['_onSync'] = _onSync;
window['onSync'] = onSync;
window['sync'] = sync;
window['setSyncingEnabled'] = setSyncingEnabled;
window['post'] = post;
window['apply'] = apply;
window['applyMessages'] = applyMessages;
window['sendMessages'] = sendMessages;
window['receiveMessages'] = receiveMessages;
