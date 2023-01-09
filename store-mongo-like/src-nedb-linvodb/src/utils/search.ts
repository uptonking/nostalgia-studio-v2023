import { cut_all } from 'jieba-wasm';

export const ignoreChars =
  ' \t\r\n~!@#$%^&*()_+-=[]【】、{}|;\':"，。、《》？αβγδεζηθικλμνξοπρστυφχψωΑΒΓΔΕΖΗΘΙΚΛΜΝΞΟΠΡΣΤΥΦΧΨΩ。，、；：？！…—·ˉ¨‘’“”々～‖∶＂＇｀｜〃〔〕〈〉《》「」『』．〖〗【】（）［］｛｝ⅠⅡⅢⅣⅤⅥⅦⅧⅨⅩⅪⅫ⒈⒉⒊⒋⒌⒍⒎⒏⒐⒑⒒⒓⒔⒕⒖⒗⒘⒙⒚⒛㈠㈡㈢㈣㈤㈥㈦㈧㈨㈩①②③④⑤⑥⑦⑧⑨⑩⑴⑵⑶⑷⑸⑹⑺⑻⑼⑽⑾⑿⒀⒁⒂⒃⒄⒅⒆⒇≈≡≠＝≤≥＜＞≮≯∷±＋－×÷／∫∮∝∞∧∨∑∏∪∩∈∵∴⊥∥∠⌒⊙≌∽√§№☆★○●◎◇◆□℃‰€■△▲※→←↑↓〓¤°＃＆＠＼︿＿￣―♂♀┌┍┎┐┑┒┓─┄┈├┝┞┟┠┡┢┣│┆┊┬┭┮┯┰┱┲┳┼┽┾┿╀╁╂╃└┕┖┗┘┙┚┛━┅┉┤┥┦┧┨┩┪┫┃┇┋┴┵┶┷┸┹┺┻╋╊╉╈╇╆╅╄';

/** tokenize Chinese using jieba */
export const tokenizeChinese = (text: string) =>
  cut_all(text).filter((token: string) => !ignoreChars.includes(token));

/**
 * search-index put tokenizer using jieba
 */
export const createIndexPutTokenizer = (idx) => {
  return (tokens, field, ops) => {
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
  }

};
