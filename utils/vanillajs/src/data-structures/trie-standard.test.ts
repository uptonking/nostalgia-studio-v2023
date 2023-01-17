import { StandardTrie } from './trie-standard';

describe('trie-standard data structure test', () => {
  let trie: StandardTrie;

  beforeEach(() => {
    trie = new StandardTrie();
  });

  test('insert', () => {
    trie.insert('apple');
    expect(trie.data).toEqual(
      JSON.parse('{"a":{"p":{"p":{"l":{"e":{"isEnd":true}}}}}}'),
    );

    trie.insert('acc');
    expect(trie.data).toEqual(
      JSON.parse(
        '{"a":{"p":{"p":{"l":{"e":{"isEnd":true}}}},"c":{"c":{"isEnd":true}}}}',
      ),
    );
  });

  test('search', () => {
    trie.insert('hello');
    trie.insert('hi');
    expect(trie.search('hi')).toBeTruthy();
    expect(trie.search('he')).toBeFalsy();
  });

  test('startsWith', () => {
    trie.insert('apple');
    expect(trie.startsWith('app')).toBeTruthy();
    expect(trie.startsWith('apP')).toBeFalsy();
    expect(trie.startsWith('hi')).toBeFalsy();
  });

  test('startsWithPaths', () => {
    trie.insert('apple');
    trie.insert('appc');
    // [ 'app', 'appl', 'apple', 'appc' ]
    expect(trie.startsWithPaths('app').length).toBe(4);
    expect(trie.startsWithPaths('appc').length).toBe(1);
    expect(trie.startsWithPaths('appd').length).toBe(0);
  });
});
