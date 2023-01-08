import test from 'tape';

import si from '../..';
import packageFile from '../../package.json' assert { type: 'json' };

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
    'search-index@' + packageFile.version,
  );

  // TODO: test rejections when trying to open with an incorrect
  // version of search-index
});
