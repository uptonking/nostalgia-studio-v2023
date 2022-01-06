const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../../utils/globalConfig');

module.exports = {
  // 'padding-right': { value: `2.25rem` }, // 36
  // 'bg-size': { value: `0.625rem` },
  // item: {
  //   disabled: {
  //     'text-color': { value: `{${prefix4g}.color.text.muted.value}` },
  //   },
  // },
  option: {
    'text-color': { value: `{${prefix4c}.form-input.text-color.value}` },
    'bg-color': { value: `{${prefix4g}.color.dark.val.value}` },
    hover: {
      'bg-color': { value: `{${prefix4g}.color.brand.primary.val.value}` },
    },
  },
};
