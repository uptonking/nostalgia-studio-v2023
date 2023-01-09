import { cut_all } from 'jieba-wasm';
import test from 'tape';

import si from '..';

const indexName = 'sandbox' + 'memdown-test';

export const ignoreChars =
  ' \t\r\n~!@#$%^&*()_+-=[]【】、{}|;\':"，。、《》？αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ。，、；：？！…—·ˉ¨‘’“”々～‖∶＂＇｀｜〃〔〕〈〉《》「」『』．〖〗【】（）［］｛｝ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫ⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛㈠㈡㈢㈣㈤㈥㈦㈧㈨㈩①②③④⑤⑥⑦⑧⑨⑩⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇≈≡≠＝≤≥＜＞≮≯∷±＋－×÷／∫∮∝∞∧∨∑∏∪∩∈∵∴⊥∥∠⌒⊙≌∽√§№☆★○●◎◇◆□℃‰€■△▲※→←↑↓〓¤°＃＆＠＼︿＿￣―♂♀┌┍┎┐┑┒┓─┄┈├┝┞┟┠┡┢┣│┆┊┬┭┮┯┰┱┲┳┼┽┾┿╀╁╂╃└┕┖┗┘┙┚┛━┅┉┤┥┦┧┨┩┪┫┃┇┋┴┵┶┷┸┹┺┻╋╊╉╈╇╆╅╄';

const tokenizeChinese = (text) =>
  cut_all(text).filter((token) => !ignoreChars.includes(token));

test('chinese+number is tokenized; english+number is not tokenized', async (t) => {
  const title = 'Gone Girl';
  const titleCn = '快速玩转飞书多维表格';
  const docTest = {
    title: titleCn + Math.random(),
    description:
      '飞书多维表格是一款以表格为基础的新一代效率应用。它具备表格的轻盈和业务系统的强大，融合了在线协作、信息管理和可视化能力，能够自适应团队思维和业务发展需求，是具备个性化能力的业务管理工具。',
    field1: title + Math.random(),
  };

  const idx = await si({
    name: indexName,
  });

  await idx.PUT([docTest], {
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
  });

  const r1 = await idx.SEARCH(tokenizeChinese(titleCn.slice(-2)));
  t.equal(r1.RESULT_LENGTH, 1);

  const r2 = await idx.SEARCH(title);
  t.equal(r2.RESULT_LENGTH, 0);

  const r3 = await idx.SEARCH(tokenizeChinese(title));
  t.equal(r3.RESULT_LENGTH, 0);

  // console.dir(r3, { depth: null });
});
