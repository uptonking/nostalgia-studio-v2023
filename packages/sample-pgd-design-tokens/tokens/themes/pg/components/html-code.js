const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../utils/globalConfig');

module.exports = {
  padding: { value: `0.0625rem 0.3125rem` },
  margin: { value: `0 0.0625rem` },
  'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
  'border-radius': { value: `0.125rem` }, // 2
  'font-size': { value: `0.75rem` }, // 12
  'line-height': { value: `{${prefix4g}.size.base.line-height.value}` }, // 1.5
  'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
  'bg-color': { value: `{${prefix4g}.color.gray.light.val.value}` },
  'border-color': {
    value: `{${prefix4g}.color.black.val.value}`,
    modify: [{ type: `setAlpha`, amount: 0.05 }],
  },
  kbd: {
    padding: { value: `{${prefix4c}.html-code.padding.value}` },
    margin: { value: `{${prefix4c}.html-code.margin.value}` },
    'border-width': { value: `{${prefix4c}.html-code.border-width.value}` },
    'border-radius': { value: `0.25rem` }, // 4
    'font-size': { value: `{${prefix4c}.html-code.font-size.value}` },
    'line-height': { value: `{${prefix4c}.html-code.line-height.value}` },
    'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
    'bg-color': { value: `{${prefix4g}.color.white.val.value}` },
    'border-color': {
      value: `{${prefix4g}.color.black.val.value}`,
      modify: [{ type: `setAlpha`, amount: 0.2 }],
    },
  },
};
