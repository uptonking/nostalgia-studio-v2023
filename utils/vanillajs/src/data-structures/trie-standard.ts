type CharNode = { [k: string]: CharNode | boolean };

/** insert + search
 * [Js实现Trie 字典树 - 掘金](https://juejin.cn/post/7067388014766325774)
 */
export class StandardTrie {
  data: CharNode = {};

  // constructor() {
  //   this.data = {};
  // }

  insert(text: string) {
    let curr = this.data;

    for (const c of text) {
      if (curr[c]) {
        curr = curr[c] as CharNode;
      } else {
        curr[c] = {};
        curr = curr[c] as CharNode;
      }
    }

    curr['isEnd'] = true;
  }

  /** check if complete input word exist in trie */
  search(text: string) {
    let curr = this.data;

    for (const c of text) {
      if (!curr[c]) {
        return false;
      } else {
        curr = curr[c] as CharNode;
      }
    }

    return curr['isEnd'] ? true : false;
  }

  startsWith(text: string) {
    let curr = this.data;
    for (const c of text) {
      if (!curr[c]) return false;
      curr = curr[c] as CharNode;
    }

    return curr;
  }

  startsWithPaths(text: string) {
    const findAll = (prefix, node, arr = [prefix]) => {
      // 👀 not for-of
      for (const key in node) {
        if (key !== 'isEnd') {
          const word = prefix + key;
          arr.push(word);
          findAll(word, node[key], arr);
        }
      }
      return arr;
    };

    const candidate = this.startsWith(text);
    if (!candidate) return [];
    return findAll(text, candidate);
  }
}
