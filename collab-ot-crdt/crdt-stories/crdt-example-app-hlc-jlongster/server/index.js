import '../shared/murmurhash';

import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import sqlite3 from 'better-sqlite3';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';

import { merkle } from '../shared/merkle';
import { Timestamp } from '../shared/timestamp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const db = sqlite3(__dirname + '/../db.sqlite');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));

/**
 * @return an array of row objects or empty array
 */
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

/** db.prepare + run，
 * @return {{ changes: number; lastInsertRowid: string; }} info
 */
function queryRun(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

/** 序列化输出字符串，在value前加上类型 */
function serializeValue(value) {
  if (value === null) {
    return '0:';
  } else if (typeof value === 'number') {
    return 'N:' + value;
  } else if (typeof value === 'string') {
    return 'S:' + value;
  }

  throw new Error('UnSerializable value type: ' + JSON.stringify(value));
}

/** 将serializeValue的值反序列化，去掉value前面的类型 */
function deserializeValue(value) {
  const type = value[0];
  switch (type) {
    case '0':
      return null;
    case 'N':
      return parseFloat(value.slice(2));
    case 'S':
      return value.slice(2);
  }

  throw new Error('Invalid type key for value: ' + value);
}

function getMerkle(group_id) {
  const rows = queryAll('SELECT * FROM messages_merkles WHERE group_id = ?', [
    group_id,
  ]);

  if (rows.length > 0) {
    return JSON.parse(rows[0].merkle); // 只返回第一行，这张表也只有1行数据
  } else {
    // No merkle trie exists yet(first sync of app), so create a default one.
    return {};
  }
}

/** 插入实参数据到messages表、messages_merkles表， 手动管理事务提交和回滚
 * - 前端业务模型的crud操作并不在这里apply，这里只是记录操作
 * @return 返回插入后得到的最新的merkle-tree
 */
function addMessages(groupId, messages) {
  let trie = getMerkle(groupId);

  queryRun('BEGIN'); // manage db transaction manually

  try {
    for (const message of messages) {
      const { dataset, row, column, value, timestamp } = message;

      const res = queryRun(
        `INSERT OR IGNORE INTO messages (timestamp, group_id, dataset, row, column, value) VALUES
        (?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        // 👀 插入db的并不是原始值，而是序列化后的value，类似 type:value
        [timestamp, groupId, dataset, row, column, serializeValue(value)],
      );

      if (res.changes === 1) {
        // Update the merkle trie
        trie = merkle.insert(trie, Timestamp.parse(message.timestamp));
      }
    }

    queryRun(
      'INSERT OR REPLACE INTO messages_merkles (group_id, merkle) VALUES (?, ?)',
      [groupId, JSON.stringify(trie)],
    );
    queryRun('COMMIT');
  } catch (e) {
    queryRun('ROLLBACK');
    throw e;
  }

  return trie;
}

// 👇🏻 后端仅此一个用于同步操作数据的接口，会被所有前端轮询来获取所需的op
// 服务端只执行简单的op消息保存与转发，并没有具体的op应用和转换逻辑
// 后端会利用merkle.diff计算需要发送给前端的修改msg，前提是前端发来自身的mk-tree
app.post('/sync', (req, res) => {
  const { group_id, client_id, messages, merkle: clientMerkle } = req.body;

  const trie = addMessages(group_id, messages);

  let newMessagesForClient = [];

  if (clientMerkle) {
    // Get the point in time (in minutes?) at which the two collections of
    // messages "forked." In other words, at this point in time, something
    // changed (e.g., one collection inserted a message that the other lacks)
    // which resulted in differing hashes.
    // 计算服务端节点的merkle-tree和客户端节点的merkle-tree最后相同的时间戳，之后开始不同
    const diffTime = merkle.diff(trie, clientMerkle);
    // console.log(';;client_id-diffTime ', client_id.slice(-2), diffTime);
    if (diffTime) {
      const diffTimestamp = new Timestamp(diffTime, 0, '0').toString();
      // 对于当前客户端，可能会收到自己最新的op，重复消息，
      newMessagesForClient = queryAll(
        `SELECT * FROM messages WHERE group_id = ? AND timestamp > ? AND timestamp NOT LIKE '%' || ? ORDER BY timestamp`,
        [group_id, diffTimestamp, client_id],
      );

      newMessagesForClient = newMessagesForClient.map((msg) => ({
        ...msg,
        value: deserializeValue(msg.value),
      }));
    }
  }

  res.send(
    JSON.stringify({
      status: 'ok',
      data: { messages: newMessagesForClient, merkle: trie },
    }),
  );
});

app.get('/ping', (req, res) => {
  res.send('ok');
});

// 首次执行时初始化数据库
// const initSql = fs.readFileSync(path.resolve('./init.sql'), 'utf-8').split(';');
// initSql.forEach(sql => {
//   console.log(sql);
//   try{
//     let result = queryRun(`${sql};`);
//     console.log(result);
//   }catch(e){console.log('already created', e)}
// });

app.listen(8006);
