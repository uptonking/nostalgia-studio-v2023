/** 每个客户端本地都有自己的 hybrid logic clock
 * @typedef {Object} HLCClock
 * @property {import('../shared/timestamp.js').MutableTimestamp} timestamp
 * @property {string} merkle
 */

/** 本地逻辑时钟，每次同步事件执行sync时都会更新
 * - "incremented" every time a message is sent or received
 * @type {HLCClock}
 */
let _clock = null;

function setClock(clock) {
  _clock = clock;
}

/**
 * @return {HLCClock} local hybrid logic clock
 */
function getClock() {
  return _clock;
}

function makeClock(timestamp, merkle = {}) {
  return { timestamp: MutableTimestamp.from(timestamp), merkle };
}

function serializeClock(clock) {
  return JSON.stringify({
    timestamp: clock.timestamp.toString(),
    merkle: clock.merkle,
  });
}

function deserializeClock(clock) {
  const data = JSON.parse(clock);
  return {
    timestamp: Timestamp.from(Timestamp.parse(data.timestamp)),
    merkle: data.merkle,
  };
}

function makeClientId() {
  return uuidv4().replace(/-/g, '').slice(-16);
}

window['_clock'] = _clock;
window['setClock'] = setClock;
window['getClock'] = getClock;
window['makeClock'] = makeClock;
window['serializeClock'] = serializeClock;
window['deserializeClock'] = deserializeClock;
window['makeClientId'] = makeClientId;
