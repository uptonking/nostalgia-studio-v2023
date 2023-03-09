import type { TextAtom } from './type';
import {
  compareItems,
  genRandomIntExclusive,
  hashItem,
  stringSplice,
} from './utils';

/** avoid 0 to allow presence checking via a || b */
const INT_MIN = 1;
/** max safe int in JS */
const INT_MAX = Math.pow(2, 53) - 1;
/**  pos(p, siteId) ts val siteId  */
const ITEM_BEGIN: TextAtom = [[INT_MIN, INT_MIN], null, '', INT_MIN];
/** pid  */
const ITEM_END: TextAtom = [[INT_MAX, INT_MAX], null, '', INT_MAX];

/**
 * ✨ a replica of a document, with a list of 'items', in 'pid' order.
 * - In Logoot, a document is made up of an array of TextAtom
 * - The pairs in the document are always sorted by their uids
 * - To perform an insertion, you simply need to generate the pair to insert.
 * - To perform a deletion, you only need to know the uid to delete.
 */
export class Doc {
  /**
   * a document is made up of an array of TextAtom
   * - must be kept in pid order
   */
  items: TextAtom[];
  /** hot copy of string, updated whenever insert/del */
  string: string;
  /** hashItem(item) -> true, 方便快速判断op是否已经执行过 */
  index: Record<string, boolean>;
  /** siteId -> maxTs
   * ? 似乎未使用
   */
  version: Record<any, any>;

  constructor(tag) {
    this.items = [ITEM_BEGIN, ITEM_END];
    this.string = '';
    this.index = {};
    this.version = {};
  }

  /** 递归找到合适的位置作为id
   * Assumes a < b, and no c s.t. a < c & c < b.
   */
  genPos(pos_a, pos_b, siteId) {
    const p_a = pos_a[0] || INT_MIN;
    const p_b = pos_b[0] || INT_MAX;
    const siteId_a = pos_a[1] || siteId;
    const siteId_b = pos_b[1] || siteId;

    if (p_a + 1 < p_b) {
      // space between p_a, p_b
      return [genRandomIntExclusive(p_a, p_b), siteId];
    } else if (p_a + 1 === p_b && siteId_a < siteId) {
      // no space, but siteId_a < siteId
      return [p_a, siteId];
    } else {
      // 👇🏻 no space, recur right，会增加深度
      return [p_a, siteId_a].concat(
        this.genPos(pos_a.slice(2), pos_b.slice(2), siteId),
      );
    }
  }

  getItem(idx) {
    // O(1)
    return this.items[idx + 1]; // account for invisible begin char
  }

  containsItem(item) {
    // O(1)
    return hashItem(item) in this.index;
  }

  /**
   * To perform an insertion, you simply need to have the pair to insert.
   * - To generate the uid for the pair, you simply have to take two existing uids and generate a random uid in between them.
   */
  ins(item: TextAtom) {
    if (this.containsItem(item)) return true; // already applied

    let idx_prev = this.items.findIndex((item_i) => {
      return compareItems(item_i, item) > -1;
    });

    const idx_next = idx_prev++;
    if (idx_next < 0) throw 'invalid item (prev not found)';

    this.items.splice(idx_next, 0, item);
    this.string = stringSplice(this.string, idx_next - 1, 0, item[2]);
    this.index[hashItem(item)] = true;

    const siteId = String(item[3]);
    const ts = item[1];
    this.version[siteId] = this.version[siteId] || 0;
    this.version[siteId] = Math.max(this.version[siteId], ts!);

    return true;
  }

  del(item: TextAtom) {
    // already deleted or not yet present (consider as failure because caller should retry in case the char is not yet present)
    if (!this.containsItem(item)) return false;

    const idx = this.items.findIndex((item_i) => {
      return compareItems(item_i, item) === 0;
    });

    this.items.splice(idx, 1);
    this.string = stringSplice(this.string, idx - 1, 1);
    delete this.index[hashItem(item)];

    return true;
  }

  reduce(reducer, initial) {
    return this.items.reduce(reducer, initial);
  }
}
