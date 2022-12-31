import { BrowserLevel } from 'browser-level';
import { EntryStream } from 'level-web-stream';
import { MemoryLevel } from 'memory-level';

(async () => {
  // An abstract-level database for browsers, backed by IndexedDB. The successor to level-js
  const db = new BrowserLevel<string, any>('lv/web', { valueEncoding: 'json' })
  // const db = new MemoryLevel();

  // Write sample data
  await db.put('a', 'a1');
  await db.put('b', 'a2');
  await db.put('c', 'a3');

  // Create a ReadableStream
  const src = new EntryStream(db, {
    gte: 'a',
  });

  // Pipe to a stream of choice
  const dst = new WritableStream({
    write([key, value]) {
      console.log(';; kv ', '%s: %s', key, value);
    },
  });

  await src.pipeTo(dst);
})();
