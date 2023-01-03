import test from 'tape';

import si from '../..';

const sandbox = 'tests/sandbox/';
const indexName = sandbox + 'version-stamp-test';

test('create a search index', async function (t) {
  t.plan(3);

  const { PUT, INDEX } = await si({
    name: indexName,
  });
  t.ok(PUT);

  t.deepEquals(
    await PUT([
      {
        _id: '0',
        text: 'just a test',
      },
    ]),
    [{ _id: '0', status: 'CREATED', operation: 'PUT' }],
  );

  t.equals(
    await INDEX.STORE.get(['CREATED_WITH']),
    // 'search-index@' + require('../../package.json').version,
    'search-index@' + '3.3.1111',
  );

  // TODO: test rejections when trying to open with an incorrect
  // version of search-index
});
