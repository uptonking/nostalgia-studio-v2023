const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../utils/globalConfig');

module.exports = {
  'min-width': { value: `6.25rem` }, // 100
  'max-width': { value: `10rem` }, // 160
  width: { value: `max-content` },
  padding: { value: `0.125rem 0.625rem` },
  'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
  'border-radius': { value: `{${prefix4g}.size.base.border-radius.value}` },
  'font-size': { value: `0.75rem` }, // 12
  'line-height': { value: `{${prefix4g}.size.base.line-height.value}` },
  'offset-negative': { value: `0.375rem` }, // 6
  'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
  'bg-color': { value: `{${prefix4g}.color.white.val.value}` },
  'border-color': { value: `transparent` },
  'box-shadow': {
    // todo full copy
    value: `0 0 0 0.0625rem {${prefix4g}.color.gray.dim.val.value}`,
    replaceRefs: `all`,
  },
};
