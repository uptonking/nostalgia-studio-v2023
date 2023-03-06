export function toArrayIndex(array: any[], str: string) {
  if (str === '-') {
    return array.length;
  }
  for (let i = 0, imax = str.length; i < imax; i++) {
    const ch = str.charCodeAt(i);
    if (57 < ch || ch < 48) {
      return Infinity;
    }
  }
  return +str;
}
