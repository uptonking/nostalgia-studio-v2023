const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../utils/globalConfig');

module.exports = {
  height: { value: `0.5rem` }, // 8
  'border-radius': { value: `2rem` },
  'font-size': { value: `0.75rem` },
  'line-height': { value: `0` },
  'bg-color': {
    value: `{${prefix4g}.color.black.val.value}`,
    modify: [{ type: `setAlpha`, amount: `0.1` }],
  },
  bar: {
    'text-color': { value: `{${prefix4g}.color.white.val.value}` },
    'bg-color': { value: `{${prefix4g}.color.brand.primary.val.value}` },
    'animated-bg-color': {
      value: `linear-gradient( to right, transparent, hsla(var(--white-color-hsl), 0.3) );`,
    },
  },
  group: {
    item: {
      margin: { value: `0.25rem` },
    },
    label: {
      'font-size': { value: `{${prefix4g}.size.base.font-size.value}` },
    },
  },
};
