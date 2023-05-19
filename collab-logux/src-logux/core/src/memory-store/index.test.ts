import { test } from 'uvu';

import { MemoryStore, eachStoreCheck } from '../index';

eachStoreCheck((desc, creator) => {
  test(
    `${desc}`,
    creator(() => new MemoryStore()),
  );
});

test.run();
