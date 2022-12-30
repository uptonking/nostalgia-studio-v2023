// ref: https://github.com/mochajs/mocha/blob/master/example/config/.mocharc.js
module.exports = {
  color: true,
  extension: ['js', 'cjs', 'mjs', 'ts'],
  'node-option': [
    'experimental-loader=ts-node/esm/transpile-only',
    'experimental-specifier-resolution=node',
  ], // without leading "--", also V8 flags
  reporter: 'spec',
  // 'reporter-option': ['foo=bar', 'baz=quux'], // array, not object
};
