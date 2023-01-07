import { MemoryLevel } from 'memory-level';

import si from '../src/main';

const indexName = 'sandbox' + 'memdown-test';

const title = 'Gone Girl';
const description = 'a wife disappeared, a husband is suspected';
const doc1 = {
  title,
  description,
  date: '2014-10-03',
};

(async () => {
  const siIdx = await si({
    db: MemoryLevel,
    name: indexName,
  });

  const putRet = await siIdx.PUT([{ ...doc1, _id: 'id11' }]);

  const allDocs = await siIdx.QUERY({ ALL_DOCUMENTS: true });
  console.log(';; allIdx ', allDocs);

  const dic = await siIdx.DICTIONARY();
  console.log(';; dic ', dic);

  const opts = {
    FACETS: ['description'],
  };
  const searchInput = description.split(' ').slice(-1)[0]
  const r1 = await siIdx.QUERY(searchInput, opts);
  const r2 = await siIdx.QUERY(title, opts);
  console.log(';; r1 ', searchInput, r1);
  console.log(';; r2 ', r2);
})();

const data = [
  {
    _id: 'a',
    title: 'quite a cool document',
    body: {
      text: 'this document is really cool cool cool',
      metadata: 'coolness documentness',
    },
    importantNumber: 5000,
  },
  {
    _id: 'b',
    title: 'quite a cool document',
    body: {
      text: 'this document is really cool bananas',
      metadata: 'coolness documentness',
    },
    importantNumber: 500,
  },
  {
    _id: 'c',
    title: 'something different',
    body: {
      text: 'something totally different',
      metadata: 'coolness documentness',
    },
    importantNumber: 200,
  },
];

// siIdx.then((idx) => {
//   // console.log(';; idx ',);
//   return idx.PUT(data).then((res) => {
//     console.log(';; put-d ', res);

//     // t.deepEqual(res, [
//     //   { _id: 'a', status: 'CREATED', operation: 'PUT' },
//     //   { _id: 'b', status: 'CREATED', operation: 'PUT' },
//     //   { _id: 'c', status: 'CREATED', operation: 'PUT' }
//     // ])
//     return idx;
//   });
// })
//   .then((idx) => {
//     idx
//       .SEARCH(['body.text:cool', 'body.text:really', 'body.text:bananas'])
//       .then((res) => {
//         console.log(';; qry-res ', res);

//         // t.deepEquals(res, {
//         //   RESULT: [
//         //     {
//         //       _id: 'b',
//         //       _match: [
//         //         { FIELD: 'body.text', VALUE: 'bananas', SCORE: '1.00' },
//         //         { FIELD: 'body.text', VALUE: 'cool', SCORE: '1.00' },
//         //         { FIELD: 'body.text', VALUE: 'really', SCORE: '1.00' }
//         //       ],
//         //       _score: 4.16
//         //     }
//         //   ],
//         //   RESULT_LENGTH: 1
//         // })
//       });
//   });
