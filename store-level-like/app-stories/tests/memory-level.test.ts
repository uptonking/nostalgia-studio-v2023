import { MemoryLevel } from 'memory-level';

(async () => {
  // Create a database
  const db = new MemoryLevel<string, any>({ valueEncoding: 'json' });

  // Add an entry with key 'a' and value 1
  await db.put('a', 11);

  // Add multiple entries
  await db.batch([{ type: 'put', key: 'b', value: 22 }]);

  // Get value of key 'a': 1
  const value = await db.get('a');

  // Iterate entries with keys that are greater than 'a'
  for await (const [key, value] of db.iterator({ gt: 'a' })) {
    console.log(';; kv', key, value); // 2
  }
})();
