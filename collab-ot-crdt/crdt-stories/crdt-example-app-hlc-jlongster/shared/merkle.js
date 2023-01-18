/* global globalThis */

function getKeys(trie) {
  return Object.keys(trie).filter((x) => x !== 'hash');
}

function keyToTimestamp(key) {
  // 16 is the length of the base 3 value of the current time in
  // minutes. Ensure it's padded to create the full value
  const fullkey = key + '0'.repeat(16 - key.length);

  // Parse the base 3 representation back into base 10 "msecs since 1970" that
  // can be easily passed to Date()
  return parseInt(fullkey, 3) * 1000 * 60;
}

/** 更新merkle-tree，每次客户端applyMessages会触发
 * - 根节点的hash通过 前根节点^新节点 得到
 * @param {Object} trie
 * @param { import('./timestamp.js').Timestamp } timestamp hlc对象，但只用了hash
 * @returns
 */
export function insert(trie, timestamp) {
  const hash = timestamp.hash();

  // Convert the timestamp's logical time (i.e., its "milliseconds since
  // 1970") to minutes, then convert that to a base-3 STRING. Base 3 meaning:
  // 0 => '0', 1 => '1', 2 => '2', 3 => '10', 2938 => '11000211'.
  //
  // This string will be used as a path to navigate the merkle tree: each
  // character is a step in the path used to navigate to the next node in the
  // trie. In other words, the logical time becomes the "key" that can be used
  // to get/set a value (the timestamp's hash) in the merkle tree.
  //
  // Since we're using base-3, each char in in the path will either be '0',
  // '1', or '2'. This means that the trie will consist of nodes that have, at
  // most, 3 child nodes.
  //
  // Note the use of the bitwise OR operator (`... | 0`). This is a quick way
  // of converting the floating-point value to an integer (in a nutshell: the
  // bitwise operators only work on 32-bit integers, so it causes the 64-bit
  // float to be converted to an integer).) For example, this causes:
  // "1211121022121110.11221000121012222" to become "1211121022121110".
  // 浮点型转整型，向下取整；精度在分钟，❓同一分钟内的hash值相同
  const key = Number((timestamp.millis() / 1000 / 60) | 0).toString(3);

  // Create a new object that has the same tree and a NEW root hash. Note that
  // "bitwise hashing" is being used here to make a new hash. Bitwise XOR
  // treats both operands as a sequence of 32 bits. It returns a new sequence
  // of 32 bits where each bit is the result of combining the corresponding
  // pair of bits (i.e., bits in the same position) from the operands. It
  // returns a 1 in each bit position for which the corresponding bits of
  // either but not both operands are 1s. 异或，相同为0，不同为1
  // 新的根节点的hash通过 前根节点^新节点 得到
  trie = { ...trie, hash: trie.hash ^ hash };

  return insertKey(trie, key, hash);
}

/**
 * The overall goal of this function is to insert a given timestamp's hash
 * into a merkle tree, where the key/path is based on a base-3 encoding of
 * the timestamp's physical time (minutes since 1970).
 *
 * In other words, we are building a data structure where time can be used to
 * retrieve a timestamp's hash--or the hash of all timestamps that occurred
 * relative to that timestamp.
 *
 * For example, a (oversimplified) base-3 key "012" would result in this:
 *
 * {
 *   "hash": 1704467157,
 *   "0": {
 *     "hash": 1704467157,
 *     "1": {
 *       "hash": 1704467157,
 *       "0": { ... }
 *       "1": { ... }
 *       "2": { ... }
 *     }
 *   }
 * }
 *
 * @param {Object} currentTrie
 * @param {string} key
 * @param {number} timestampHash
 * @returns an object， { hash: string; '0': object; '1': object; '2': object }
 */
function insertKey(currentTrie, key, timestampHash) {
  if (key.length === 0) {
    // 递归终止条件
    return currentTrie;
  }

  // Only grab the first char from the base-3 number (e.g., "20" -> "2")
  const childKey = key[0];

  // Get ref to existing child node (or create a new one)
  const currChild = currentTrie[childKey] || {};

  // Create/rebuild the child node with a (possibly) new hash that
  // incorporates the passed-in hash, and new new/rebuilt children (via a
  // recursive call to `insertKey()`). In other words, since `key.length > 0`
  // we have more "branches" of the trie hierarchy to extend before we reach a
  // leaf node and can begin returning.
  //
  // The first time the child node is built, it will have hash A. If another
  // timestamp hash (B) is inserted, and this node is a "step" in the
  // insertion path (i.e., it is the target node or a parent of the target
  // node), then the has will be updated to be hash(A, B).
  const newChild = {
    ...currChild,
    // Note that we're using key.slice(1) to make sure that, for the next
    // recursive call, we are moving on to the next "step" in the "path"
    // (i.e., the next character in the key string). If `key.slice() === ''`
    // then `insertKey()` will return `currChild`--in which case all we are
    // doing here is setting the `hash` property.
    ...insertKey(currChild, key.slice(1), timestampHash),
    // Update the current node's hash. If we don't have a hash (i.e., we just
    // created `currChild` and it is an empty object) then this will just be
    // the value of the passed-in hash from our "parent" node. In effect, an
    // "only child" node will have the same hash as its parent; only when a
    // a 2nd (or later)
    hash: currChild.hash ^ timestampHash,
  };

  // Create a new sub-tree object, copying in the existing true, but...
  return {
    ...currentTrie,
    // ...set a new node value for the current key path char
    // (e.g., { 0: ..., 1: ..., 2: ... }).
    // 树的指针并不是传统的left/right/parent，而是固定的属性名 hash/0/1/2
    [childKey]: newChild,
  };
}

/** 创建merkle-tree，并没有使用msg实际内容，因为msg的时间戳是唯一的，可代表msg；
 * - unused
 */
function build(timestamps) {
  const trie = {};
  for (const timestamp of timestamps) {
    insert(trie, timestamp);
  }
  return trie;
}

/** algorithm for finding the last known "time of equality"
 * - the mechanism isn't going to result in only unknown messages being sync'ed; there will be dupes.
 * - But the trade-off for complete efficiency is speed.
 * - 使用场景：客户端离线恢复时计算需要发送的msg，服务端发送给客户端的必要msg
 * @param {Object} trie1
 * @param {Object} trie2
 * @returns 相等时返回null
 */
export function diff(trie1, trie2) {
  if (trie1.hash === trie2.hash) {
    return null;
  }

  let node1 = trie1;
  let node2 = trie2;
  /** 不同时间位数连起来的路径 */
  let k = '';

  while (true) {
    // At this point we have two node objects. Each of those objects will have
    // some properties like '0', '1', '2', or 'hash'. The numeric props (note
    // that they are strings) are what we care about--they are the keys we can
    // use to access child nodes, and we will use them to compare the two
    // nodes.
    //
    // `getKeys()` will return the prop names, filtering out `hash`. In effect
    // we are creating a set that has keys that exist on either of the nodes
    // (so the set will contain, at most: '0', '1', and '2').
    const keyset = new Set([...getKeys(node1), ...getKeys(node2)]);
    const keys = [...keyset.values()]; // Convert to arrays like ['0', '2']

    // Before we start to compare the two nodes, we want to sort the keys.
    // ❓ 改成降序排列能否提高查找速度
    keys.sort();

    // Compare the hash for each of the child nodes. Find the _first_ key for
    // which the child nodes have different hashes.
    // 👇🏻 找到hash值第一对不同的节点
    const diffkey = keys.find((key) => {
      const childNode1 = node1[key] || {};
      const childNode2 = node2[key] || {};
      return childNode1.hash !== childNode2.hash;
    });

    // If we didn't find anything, it means the child nodes have the same
    // hashes--so we have found a point in time when the two tries equal.
    // 没有不同的了，剩下的都是相同的
    if (!diffkey) {
      return keyToTimestamp(k);
    }

    // If we got this far, it means we found a location where the two tries
    // differ (i.e., each trie has a child node at this position, but they
    // have different hashes--meaning they are the result of different
    // messages). We want to continue down this path and keep comparing nodes
    // until we can find a position where the hashes equal.
    //
    // Note that as we continue to recurse the trie, we are appending the
    // keys. This string of digits will be parsed back intoa time eventually,
    // so as we keep appending characters we are basically building a more and
    // more precise Date/time. For example:
    //  - Less precise: `new Date(1581859880000)` == 2020-02-16T13:31:20.000Z
    //  - More precise: `new Date(1581859883747)` == 2020-02-16T13:31:23.747Z
    k += diffkey; // 不同的就保留，注意key的path连起来才代表时间
    node1 = node1[diffkey] || {};
    node2 = node2[diffkey] || {};
  }
}

function prune(trie, n = 2) {
  // Do nothing if empty
  if (!trie.hash) {
    return trie;
  }

  let keys = getKeys(trie);
  keys.sort();

  const next = { hash: trie.hash };
  keys = keys.slice(-n).map((k) => (next[k] = prune(trie[k], n)));

  return next;
}

function debug(trie, k = '', indent = 0) {
  const str =
    ' '.repeat(indent) +
    (k !== '' ? `k: ${k}  ` : '') +
    `hash: ${trie.hash || '(empty)'}\n`;
  return (
    str +
    getKeys(trie)
      .map((key) => {
        return debug(trie[key], key, indent + 2);
      })
      .join('')
  );
}

/** merkle tree only stores what it needs to answer the question  快速定位修改
 * "what is the last time at which the collections had the same messages?":
 * time (as keys) and hashes (as values) made from all known messages at those times.
 * - 每个op消息msg都拥有的hlc时钟，可作为msg的唯一标识，所以merkle-tree节点保存的是时间戳的hash
 * - merkle-tree的节点是完全三叉树，核心方法是 insert和diff
 * - rolling hash only tells you if the clients have encountered the same messages (i.e., if their rolling hashes were derived from the same set of message hashes);
 *    - it doesn't help you figure out how the collections differ.
 * - merkle tree is a data structure for quickly comparing collections to see if they have the same items.
 *    - merkle tree in this app indexes rolling hashes of "known messages" by the times for those messages.
 *    - This means you can quickly compare two merkle trees, and if they differ, find the most recent "message time" when they were the same.
 * - 未提供update，提供了insert
 * - 不保存具体数据，只保存hash
 */
export const merkle = {
  getKeys,
  keyToTimestamp,
  insert,
  build,
  diff,
  prune,
  debug,
};

globalThis['merkle'] = merkle;
globalThis['md'] = debug;
// globalThis['mgetKeys'] = getKeys;

/** 首次渲染后填充完预置数据和添加一个待办项后的_clock.merkle */
const mockMerkle = {
  1: {
    2: {
      2: {
        1: {
          0: {
            2: {
              1: {
                2: {
                  0: {
                    0: {
                      0: {
                        1: {
                          1: {
                            2: {
                              1: {
                                2: {
                                  hash: -716630163,
                                },
                                hash: -716630163,
                              },
                              hash: -716630163,
                            },
                            hash: -716630163,
                          },
                          hash: -716630163,
                        },
                        2: {
                          0: {
                            0: {
                              0: {
                                1: {
                                  hash: 308441994,
                                },
                                hash: 308441994,
                              },
                              hash: 308441994,
                            },
                            hash: 308441994,
                          },
                          hash: 308441994,
                        },
                        hash: -953457433,
                      },
                      hash: -953457433,
                    },
                    hash: -953457433,
                  },
                  hash: -953457433,
                },
                hash: -953457433,
              },
              hash: -953457433,
            },
            hash: -953457433,
          },
          hash: -953457433,
        },
        hash: -953457433,
      },
      hash: -953457433,
    },
    hash: -953457433,
  },
  hash: -953457433,
};

// console.log(debug(mockMerkle));
// console.log(getKeys(mockMerkle));
