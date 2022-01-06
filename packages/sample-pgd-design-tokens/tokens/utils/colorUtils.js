// const { parseToRgb, parseToHsl, toColorString } = require('polished');
const tinycolor = require('tinycolor2');

const colorUtils = {
  // hslToHex: (hslStr) => toColorString(parseToHsl(hslStr)),
  hslToHex: (hslStr) => tinycolor(hslStr).toHexString(),
};

module.exports = colorUtils;
