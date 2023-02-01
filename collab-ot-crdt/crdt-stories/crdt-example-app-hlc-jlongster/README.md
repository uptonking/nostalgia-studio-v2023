This is a demo app used for my dotJS 2019 talk ["CRDTs for Mortals"](https://www.youtube.com/watch?v=DEcwa68f-jY).

> https://github.com/jlongster/crdt-example-app

Slides here: https://jlongster.com/s/dotjs-crdt-slides.pdf

View this app here: https://crdt.jlongster.com

It contains a full implementation of [hybrid logical clocks](https://cse.buffalo.edu/tech-reports/2014-04.pdf) to generate timestamp for causal ordering of messages. Using these timestamps, CRDTs can be easily used to change local data that also syncs to multiple devices. This also contains an implementation of a merkle tree to check consistency of the data to make sure all clients are in sync.

It provides a server to store and retrieve messages, so that clients don't have to connect peer-to-peer.

> 普通http服务器，未使用websocket

The entire implementation is tiny, but provides a robust mechanism for writing distributed apps:

* Server: 132 lines of JS
* Client: 639 lines of JS

(This does not include `main.js` in the client which is the implementation of the app. This is just showing the tiny size of everything needed to build an app)

- issues-not-yet (看看github的issues)
  - [ ] `SELECT * FROM messages WHERE timestamp > ? AND timestamp NOT LIKE '%' || ? ORDER BY timestamp` 中的`||`什么意思？

- roadmap
  - 加入房间的客户端才自动获取协作更新，其余客户端显示默认版本，其他客户端可稍后加入房间

- 本示例缺点
  - app初始数据由db的messages表所有op记录apply到本地计算得到，全表传输加本地计算可能导致性能问题
  - 本地存放的op-msg历史数据全局对象_messages都在内存，可能导致内存溢出
    - 每个客户端都会保存所有op记录到内存，从db表获取到的记录会一直在本地_messages
  - 本示例以从服务端查询到的数据为唯一数据源，未持久化到浏览器web storage

- 本示例要点
  - hlc逻辑时钟
    - sendMessages(db), 每次crud操作对应的message都会带有一个新时间戳，来自 Timestamp.send，一般+1
    - receiveMessages(sync), 每次收到服务端op都会执行 Timestamp.recv，更新本地hlc为更大的
  - app业务数据模型定义在前端，sqlite数据库只记录历史操作，服务端并不直接处理业务模型的crud
  - 本示例协作的粒度是对象属性，所以可能存在输入内容被全部替换，而不是合并操作A和B
  - 客户端op操作基本数据： some-client did something/op at sometime
  - merkle-tree的作用，校验数据的一致性，快速定位上次同步时间
    - 本地每次插入msg时，会更新本地mk树
    - 服务端每次插入msg时，会更新服务端mk树
    - 本地从离线恢复到同步时，会检查服务端返回的mk树和本地的mk树，然后确定本地需要发送的缓存op
    - merkle tree only stores what it needs to answer the question "what is the last time at which the collections had the same messages?": time (as keys) and hashes (as values) made from all known messages at those times.
    - 当每层节点排序后，从左到右就是时间增长的方向

- 同步逻辑
  - 同步的时机：每次sendMessages
  - 本示例使用了中心服务器，所有节点都会和服务端同步，但若改为无中心化架构逻辑也相同
  - 每次客户端执行sync都会发送自己的merkle-tree数据到服务端，让服务端快速计算需要返回的op记录
  - sendMessages会触发同步sync，post的内容包括 `{ group_id, client_id, messages, merkleTrie}`，注意发送时msg不包含client_id，但服务端入库时会每行会包含它，减少了传输size

- 离线重连的流程
  - 离线时，本地_messages历史表会继续增加，但不会触发post同步
  - 恢复在线时，post执行一次空op后，会比较返回的clock和本地的clock，再次post本地有效op
    - 在sync方法中，执行`sync([], diffTime)`，会利用merkle-tree算出diffTime最近修改时间


  - [x] 每个客户端的merkle-tree是否可替换为一个代表本客户端上次同步iso时间的简单字符串
    - 不可以，因为每次同步要发送整棵树到服务端计算最小op集合，服务端可能有旧的op节点的hlc更小但未执行过
  - [x] 客户端的op被服务端入库后，另一个客户端为什么收不到，diffTime始终为null？
    - 因为原始代码被意外修改了，timestamp.hash()未返回合法哈希值


- [为什么merkle-tree采用三叉树，而不是常见的二叉树？](https://github.com/jlongster/crdt-example-app/issues/3#issuecomment-686301759)
  - As for why a ternary tree instead of a binary tree, it’s probably just to reduce the depth of the tree to make traversal faster. I actually wonder if a higher base might work even better but I haven’t thought through it enough yet and it probably doesn’t matter much.
  - It also simplifies traversal of the tree and somewhat reduces rebalancing concerns which could otherwise become an issue with monotonically increasing keys, since the "trie" representation means that the key is embedded in the tree structure itself. In this case, the tree starts out very unbalanced but becomes more balanced over time.
  - Merkle path has precision in minutes, am I right? If so, several edits that occur during one minute will have the same path in Merkle tree - 012 and 012 for example. How does a sync engine deal with a lot of edits during one minute?

Links:

* Actual: https://actualbudget.com/
* Hybrid logical clocks: https://cse.buffalo.edu/tech-reports/2014-04.pdf
* CRDTs: https://bit.ly/2DMk0AD
* Live app: https://crdt.jlongster.com/

## How to Run

You can just open `client/index.html` in a browser (i.e., access via `file://` URI). Alternatively, you can serve it from a web server (e.g., `npx serve` and open `http://localhost:5000/client/` ).

By default, the UI will sync with the data hosted at `https://crdt.jlongster.com/server/sync` . See instructions below for syncing with your own local server.

### Optional: Run the server to sync with your own database

1. `yarn install`
2. `./run` to start the server (this will create `server/db.sqlite`).
3. Open `server/db.sqlite` in a SQLite client and run `server/init.sql` to create the schema.
4. Modify the UI to sync with your local server: edit `client/sync.js:post()` to use `http://localhost:8006/sync` instead of `https://crdt.jlongster.com/server/sync`.
