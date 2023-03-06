export function shallowCopy(obj: any) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    const len = obj.length;
    const ary = new Array(len);

    for (let i = 0; i < len; i++) {
      ary[i] = obj[i];
    }

    return ary;
  }

  const keys = Object.keys(obj);
  const copy: any = {};

  for (let j = 0, jmax = keys.length; j < jmax; j++) {
    const key = keys[j];
    copy[key] = obj[key];
  }

  return copy;
}
