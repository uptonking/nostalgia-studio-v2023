import * as array from './array.test';
import * as binary from './binary.test';
import * as buffer from './buffer.test';
import * as cache from './cache.test';
import * as diff from './diff.test';
import * as encoding from './encoding.test';
import { isBrowser, isNode } from './environment';
import * as eventloop from './eventloop.test';
import * as func from './function.test';
import * as indexeddb from './indexeddb.test';
import * as list from './list.test';
import * as log from './logging';
import * as logging from './logging.test';
import * as map from './map.test';
import * as math from './math.test';
import * as metric from './metric.test';
import * as number from './number.test';
import * as object from './object.test';
import * as pair from './pair.test';
import * as prng from './prng.test';
import * as promise from './promise.test';
import * as queue from './queue.test';
import * as random from './random.test';
import * as set from './set.test';
import * as sort from './sort.test';
import * as statistics from './statistics.test';
import * as storage from './storage.test';
import * as string from './string.test';
import { runTests } from './testing';
import * as testing from './testing.test';
import * as time from './time.test';
import * as url from './url.test';

/* istanbul ignore if */
if (isBrowser) {
  log.createVConsole(document.body);
}

runTests({
  array,
  logging,
  string,
  encoding,
  diff,
  testing,
  indexeddb,
  prng,
  statistics,
  binary,
  random,
  promise,
  queue,
  map,
  eventloop,
  time,
  pair,
  object,
  math,
  number,
  buffer,
  set,
  sort,
  url,
  metric,
  func,
  storage,
  list,
  cache,
}).then((success) => {
  /* istanbul ignore next */
  if (isNode) {
    process.exit(success ? 0 : 1);
  }
});
