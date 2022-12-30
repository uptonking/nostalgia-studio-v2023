export function getCallback(options, callback) {
  return typeof options === 'function' ? options : callback;
}

export function getOptions(options, def) {
  if (typeof options === 'object' && options !== null) {
    return options;
  }

  if (def !== undefined) {
    return def;
  }

  return {};
}
