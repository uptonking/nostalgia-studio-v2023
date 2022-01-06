const { globalPrefix: prefix4g } = require('../../utils/globalConfig');
const palette = require('./color-palette');
const colorGlobal = require('./color-global');
const size = require('./size');

module.exports = {
  [prefix4g]: {
    color: { ...palette, ...colorGlobal },
    size,
  },
};
