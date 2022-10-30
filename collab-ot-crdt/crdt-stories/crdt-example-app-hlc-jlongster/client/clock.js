/** 每个客户端本地都有自己的 hybrid logic clock
 * @typedef {Object} HLCClock
 * @property {import('../shared/timestamp.js').MutableTimestamp} timestamp
 * @property {Object} merkle
 */

/** hybrid logical clock per device，每次同步事件执行sync时都会更新
 * - The main goal with clocks as they pertain to distributed databases is to be able to order events.
 * - "incremented" every time a message is sent or received
 * @type {HLCClock}
 */
let _clock = null;

function setClock(clock) {
  _clock = clock;
}

/**
 * @return {HLCClock} local hybrid logical clock
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
