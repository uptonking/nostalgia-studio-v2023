import test from 'tape';

import si from '..';

const indexName = 'sandbox' + 'memdown-test';

test('query with Facets option', async (t) => {
  const title = 'Gone Girl';
  const description = 'a wife disappeared, a husband is suspected';
  const doc1 = {
    title,
    description,
    date: '2014-10-03',
  };

  const siIdx = await si({
    name: indexName,
  });

  const putRet1 = await siIdx.PUT([{ ...doc1, _id: 'id11' }]);
  const putRet2 = await siIdx.PUT([
    { ...doc1, _id: 'id12', description: 'hello, desc' },
  ]);

  // const allDocs = await siIdx.QUERY({ ALL_DOCUMENTS: true });
  // console.log(';; allIdx ', allDocs);
  // const dic = await siIdx.DICTIONARY();
  // console.log(';; dic ', dic);

  const opts = {
    FACETS: [{ FIELD: 'description' }],
    // DOCUMENTS: true
  };
  const searchInput = description.split(' ').slice(-1)[0];
  // const r1 = await siIdx.QUERY(searchInput, opts);
  // const r2 = await siIdx.QUERY(title, opts);
  const r1 = await siIdx.QUERY(
    {
      AND: [...searchInput.split(' ')],
    },
    {
      // DOCUMENTS: true,
      ...opts,
    },
  );
  t.equal(r1.RESULT_LENGTH, 1);
  const r2 = await siIdx.QUERY(
    // {
    //   AND: [...title.split(' ')],
    // }
    title,
    {
      // DOCUMENTS: true,
      ...opts,
    },
  );
  t.equal(r2.RESULT_LENGTH, 0);

  // console.log(';; r1 ', searchInput);
  // console.dir(r1, { depth: null });
  // console.log(';; r2 ', title);
  // console.dir(r2, { depth: null });
});
