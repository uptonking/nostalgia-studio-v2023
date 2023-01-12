import { cut_all } from 'jieba-wasm';
import { MemoryLevel } from 'memory-level';

import si from '../src/main';

const indexName = 'sandbox' + 'memdown-test';

const title = 'Gone Girl';
const description = 'a wife disappeared, a husband is suspected';

const data = [
  {
    _id: 'a',
    title: '第一篇标题 quite a cool document1',
    body: {
      text: 'this document is really cool cool cool',
      metadata: 'coolness documentness',
    },
    importantNumber: 5000,
  },
  {
    _id: 'b',
    title: '第二篇标题 quite a cool document',
    body: {
      text: 'this document is really cool bananas. 飞书多维表格是一款以表格为基础的新一代效率应用。它具备表格的轻盈和业务系统的强大，融合了在线协作、信息管理和可视化能力，能够自适应团队思维和业务发展需求，是具备个性化能力的业务管理工具。',
      metadata: 'coolness documentness',
    },
    importantNumber: 500,
  },
  {
    _id: 'c',
    title: '第三篇标题 something different',
    body: {
      text: 'something totally different 不同的内容',
      metadata: 'coolness documentness',
    },
    importantNumber: 200,
  },
];

export const ignoreChars =
  ' \t\r\n~!@#$%^&*()_+-=[]【】、{}|;\':"，。、《》？αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ。，、；：？！…—·ˉ¨‘’“”々～‖∶＂＇｀｜〃〔〕〈〉《》「」『』．〖〗【】（）［］｛｝ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫ⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛㈠㈡㈢㈣㈤㈥㈦㈧㈨㈩①②③④⑤⑥⑦⑧⑨⑩⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇≈≡≠＝≤≥＜＞≮≯∷±＋－×÷／∫∮∝∞∧∨∑∏∪∩∈∵∴⊥∥∠⌒⊙≌∽√§№☆★○●◎◇◆□℃‰€■△▲※→←↑↓〓¤°＃＆＠＼︿＿￣―♂♀┌┍┎┐┑┒┓─┄┈├┝┞┟┠┡┢┣│┆┊┬┭┮┯┰┱┲┳┼┽┾┿╀╁╂╃└┕┖┗┘┙┚┛━┅┉┤┥┦┧┨┩┪┫┃┇┋┴┵┶┷┸┹┺┻╋╊╉╈╇╆╅╄';

const tokenizeChinese = (text) =>
  cut_all(text).filter((token) => !ignoreChars.includes(token));

si({
  db: MemoryLevel,
  name: indexName,
  storeVectors: true,
})
  .then((idx) => {
    // console.log(';; idx ',);
    return idx
      .PUT(data, {
        tokenizer(tokens, field, ops) {
          const {
            SKIP,
            LOWCASE,
            REPLACE,
            NGRAMS,
            STOPWORDS,
            SCORE_TERM_FREQUENCY,
          } = idx.TOKENIZATION_PIPELINE_STAGES;

          return Promise.resolve([tokenizeChinese(tokens), field, ops])
            .then(SKIP)
            .then(LOWCASE)
            .then(REPLACE)
            .then(NGRAMS)
            .then(STOPWORDS)
            .then(SCORE_TERM_FREQUENCY)
            .then(([tokens]) => tokens);
        },
      })
      .then((res) => {
        console.log(';; put-d ', res);
        // t.deepEqual(res, [
        //   { _id: 'a', status: 'CREATED', operation: 'PUT' },
        //   { _id: 'b', status: 'CREATED', operation: 'PUT' },
        //   { _id: 'c', status: 'CREATED', operation: 'PUT' }
        // ])
        return idx;
      });
  })
  .then((idx) => {
    idx.SEARCH(tokenizeChinese('标题')).then((res) => {
      console.log(';; qry-res ', res);

      // t.deepEquals(res, {
      //   RESULT: [
      //     {
      //       _id: 'b',
      //       _match: [
      //         { FIELD: 'body.text', VALUE: 'bananas', SCORE: '1.00' },
      //         { FIELD: 'body.text', VALUE: 'cool', SCORE: '1.00' },
      //         { FIELD: 'body.text', VALUE: 'really', SCORE: '1.00' }
      //       ],
      //       _score: 4.16
      //     }
      //   ],
      //   RESULT_LENGTH: 1
      // })
    });
  });
