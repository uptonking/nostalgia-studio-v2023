import fii from 'fergies-inverted-index/src/main';
import LRU from 'lru-cache';

import reader from './read';
import * as tp from './tokenisationPipeline';
import writer from './write';

// import packageJSON from '../package.json';

const makeASearchIndex = (ops) =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (resolve) => {
    // TODO: the cache size should be an option
    const cache = new LRU({
      max: 1000,
    });

    // eslint-disable-next-line
    const queue = new (await import('p-queue')).default({ concurrency: 1 });

    // TODO: should be just ops?
    const w = writer(ops, cache, queue);
    const r = reader(ops, cache);

    // TODO: more caching
    return w._INCREMENT_DOC_COUNT(0).then(() =>
      resolve({
        // internal functions inherited from fergies-inverted-index
        _AND: ops.fii.AND,
        _BUCKET: ops.fii.BUCKET,
        _GET: ops.fii.GET,
        _NOT: ops.fii.NOT,
        _OR: ops.fii.OR,
        // TODO: should cache be at the fii level?
        _CACHE: cache,
        // search-index read
        _PAGE: r.PAGE,
        _SCORE: r.SCORE,
        _SEARCH: r.SEARCH,
        _SORT: r.SORT,

        // public API (write)
        DELETE: w.DELETE,
        FLUSH: w.FLUSH,
        IMPORT: w.IMPORT,
        PUT: w.PUT,
        PUT_RAW: w.PUT_RAW,
        TOKENIZATION_PIPELINE_STAGES: tp,

        // public API (read)
        ALL_DOCUMENTS: r.ALL_DOCUMENTS,
        BUCKETS: ops.fii.BUCKETS,
        CREATED: ops.fii.CREATED,
        DICTIONARY: r.DICTIONARY,
        DISTINCT: r.DISTINCT,
        DOCUMENTS: r.DOCUMENTS,
        DOCUMENT_COUNT: r.DOCUMENT_COUNT,
        EXPORT: ops.fii.EXPORT,
        FACETS: r.FACETS,
        FIELDS: ops.fii.FIELDS,
        INDEX: ops.fii,
        LAST_UPDATED: ops.fii.LAST_UPDATED,
        MAX: ops.fii.MAX,
        MIN: ops.fii.MIN,
        QUERY: r.QUERY,
        SEARCH: r.SEARCH,
      }),
    );
  });

const initIndex = (ops = {}) =>
  new Promise((resolve, reject) => {
    // TODO: dont pass tokenization ops through to fii. Use the
    // tokenization pipeline instead and always initialize fii with the
    // same ops
    ops = {
      cacheLength: 1000,
      caseSensitive: false,
      docExistsSpace: 'DOC_RAW',
      idGenerator: (function* generateId() {
        let i = 0;
        while (true) {
          yield Date.now() + '-' + i++;
        }
      })(),
      skipFields: [],
      ngrams: {},
      replace: {},
      storeRawDocs: true,
      stopwords: [],
      storeVectors: true, // TODO: make a test for this being false
      tokenAppend: '#',
      tokenSplitRegex: /[\p{L}\d]+/gu,
      tokenizer: tp.tokenizer,
      ...ops,
    };

    return fii(ops).then((aNewFii) =>
      resolve({
        fii: aNewFii,
        ...ops,
      }),
    );
  });

const validateVersion = (si) =>
  new Promise((resolve, reject) => {
    const key = ['CREATED_WITH'];
    // const version = 'search-index@' + packageJSON.version
    const version = 'search-index@' + '3.3.1111';
    // eslint-disable-next-line no-promise-executor-return
    return si.INDEX.STORE.get(key)
      .then((v) =>
        // throw a rejection if versions do not match
        version === v
          ? resolve()
          : reject(
              new Error(
                'This index was created with ' +
                  v +
                  ', you are running ' +
                  version,
              ),
            ),
      )
      .catch((e) => si.INDEX.STORE.put(key, version).then(resolve));
  });

export default function main(ops) {
  return initIndex(ops)
    .then(makeASearchIndex)
    .then((si) => validateVersion(si).then(() => si));
}