const { globalPrefix: prefix4g } = require('../../utils/globalConfig');
const palette = require('./color-palette');
const colorGlobal = require('./color-global');
const size = require('./size');

const prefixedTokens = {
  [prefix4g]: {
    color: { ...palette, ...colorGlobal },
    size,
  },
};

// console.log('==halfmoon--dark prefixed global tokens: ', JSON.stringify(prefix4g));

module.exports = prefixedTokens;
