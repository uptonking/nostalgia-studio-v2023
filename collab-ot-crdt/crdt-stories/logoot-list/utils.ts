/** Array.prototype.splice for Strings. */
export function stringSplice(str, start, deleteCount, item?: string) {
  return str.slice(0, start) + (item || '') + str.slice(start + deleteCount);
}

/** Generates a random integer in [lower, upper]. */
export function genRandomIntExclusive(lower, upper) {
  if (upper - lower < 2) throw 'invalid bounds';
  const min = lower + 1;
  const max = upper - 1;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function hashItem(item) {
  return item[0].join(',');
}

export function compareItems(item_a, item_b) {
  const pos_a = item_a[0] || [];
  const pos_b = item_b[0] || [];
  const ts_a = item_a[1];
  const ts_b = item_b[1];
  const len_a = pos_a.length;
  const len_b = pos_b.length;

  for (let idx = 0, len = Math.min(len_a, len_b); idx < len; idx++) {
    const ydx = idx * 2;
    const zdx = ydx + 1;
    const p_a = pos_a[ydx];
    const p_b = pos_b[ydx];
    const siteId_a = pos_a[zdx];
    const siteId_b = pos_b[zdx];

    if (p_a < p_b || (p_a === p_b && siteId_a < siteId_b)) {
      return -1;
    } else if (p_a > p_b || (p_a === p_b && siteId_a > siteId_b)) {
      return 1;
    }
  }

  if (len_a < len_b || (len_a === len_b && ts_a < ts_b)) {
    return -1;
  } else if (len_a > len_b || (len_a === len_b && ts_a > ts_b)) {
    return 1;
  } else {
    return 0;
  }
}
