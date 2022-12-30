import { BrowserLevel } from 'browser-level';

(async () => {
  // An abstract-level database for browsers, backed by IndexedDB. The successor to level-js
  const db = new BrowserLevel<string, any>('lv/web', { valueEncoding: 'json' })

  // Add an entry with key 'a' and value 1
  await db.put('a', 111)

  // Add multiple entries
  await db.batch([{ type: 'put', key: 'b', value: 222 }])

  // Get value of key 'a': 1
  const value = await db.get('a')

  // Iterate entries with keys that are greater than 'a'
  for await (const [key, value] of db.iterator({ gt: 'a' })) {
    console.log(';; kv ', key, value) // 2
  }

})();

