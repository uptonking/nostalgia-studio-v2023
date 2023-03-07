import {
  compareItems,
  genRandomIntExclusive,
  hashItem,
  stringSplice,
} from './utils';

/** avoid 0 to allow presence checking via a || b */
var INT_MIN = 1;
/** max safe int in JS */
var INT_MAX = Math.pow(2, 53) - 1;
/**  pos(p, siteId) ts val siteId  */
var ITEM_BEGIN = [[INT_MIN, INT_MIN], null, '', INT_MIN];
/** |------- pid -------| */
var ITEM_END = [[INT_MAX, INT_MAX], null, '', INT_MAX];

/**
 * ✨ a replica of a document, with a list of 'items', in 'pid' order.
 */
export class Doc {
  /**  */
  tag: any;
  /** must be kept in pid order */
  items: (string | number | number[] | null)[][];
  /** hot copy of string */
  string: string;
  /** hashItem(item) -> true */
  index: Record<string, boolean>;
  /** siteId -> maxTs */
  version: Record<any, any>;

  constructor(tag) {
    this.tag = tag;
    this.items = [ITEM_BEGIN, ITEM_END];
    this.string = '';
    this.index = {};
    this.version = {};
  }

  /** Assumes a < b, and no c s.t. a < c & c < b. */
  genPos(pos_a, pos_b, siteId) {
    var p_a = pos_a[0] || INT_MIN;
    var p_b = pos_b[0] || INT_MAX;
    var siteId_a = pos_a[1] || siteId;
    var siteId_b = pos_b[1] || siteId;

    if (p_a + 1 < p_b) {
      // space between p_a, p_b
      return [genRandomIntExclusive(p_a, p_b), siteId];
    } else if (p_a + 1 === p_b && siteId_a < siteId) {
      // no space, but siteId_a < siteId
      return [p_a, siteId];
    } else {
      // no space, recur right
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

  ins(item) {
    if (this.containsItem(item)) return true; // already applied

    var idx_prev = this.items.findIndex(function (item_i) {
      return compareItems(item_i, item) > -1;
    });

    var idx_next = idx_prev++;
    if (idx_next < 0) throw 'invalid item (prev not found)';

    this.items.splice(idx_next, 0, item);
    this.string = stringSplice(this.string, idx_next - 1, 0, item[2]);
    this.index[hashItem(item)] = true;

    var siteId = String(item[3]);
    var ts = item[1];
    this.version[siteId] = this.version[siteId] || 0;
    this.version[siteId] = Math.max(this.version[siteId], ts);

    return true;
  }

  del(item) {
    // already deleted or not yet present (consider as failure because caller should retry in case the char is not yet present)
    if (!this.containsItem(item)) return false;

    var idx = this.items.findIndex(function (item_i) {
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
