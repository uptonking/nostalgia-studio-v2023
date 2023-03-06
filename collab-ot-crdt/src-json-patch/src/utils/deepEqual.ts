export function deepEqual(a: any, b: any) {
  if (a === b) {
    return true;
  }

  if (!(a && b) || typeof a !== 'object' || typeof b !== 'object') {
    return false;
  }

  if (a.length !== b.length) {
    return false;
  }

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      return false;
    }
    for (let i = 0, imax = a.length; i < imax; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false;
      }
    }
    return true;
  }

  const aKeys = Object.keys(a);

  if (aKeys.length !== Object.keys(b).length) {
    return false;
  }

  for (let j = 0, jmax = aKeys.length; j < jmax; j++) {
    const key = aKeys[j];
    if (!deepEqual(a[key], b[key])) {
      return false;
    }
  }

  return true;
}
