function esc(m: string) {
  return m === '~0' ? '~' : '/';
}

export function toKeys(path: string) {
  const keys = path.split('/');

  if (!path.includes('~')) {
    return keys;
  }

  for (let i = 0, imax = keys.length; i < imax; i++) {
    if (keys[i].includes('~')) {
      keys[i] = keys[i].replace(/~[01]/g, esc);
    }
  }

  return keys;
}
