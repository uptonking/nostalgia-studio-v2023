const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../utils/globalConfig');

module.exports = {
  content: {
    spacing: {
      val: { value: `{${prefix4g}.size.content.spacing.val.value}` }, // 30
      xs: { value: `{${prefix4g}.size.content.spacing.xs.value}` }, // 20
      half: { value: `{${prefix4g}.size.content.spacing.half.value}` },
      'xs-half': { value: `{${prefix4g}.size.content.spacing.xs-half.value}` },
    },
    title: {
      'font-size': {
        value: `{${prefix4g}.size.content.title.font-size.value}`,
      },
      'font-weight': {
        value: `{${prefix4g}.size.content.title.font-size.value}`,
      },
    },
  },
  'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
  'border-radius': { value: `{${prefix4g}.size.base.border-radius.value}` },
  'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
  'bg-color': { value: `{${prefix4g}.color.white.val.value}` },
  'border-color': {
    value: `{${prefix4g}.color.black.val.value}`,
    modify: [{ type: `setAlpha`, amount: `0.2` }],
  },
  'box-shadow': { value: `none` },
  title: {
    'font-size': { value: `{${prefix4g}.size.content.title.font-size.value}` },
    'font-weight': {
      value: `{${prefix4g}.size.content.title.font-weight.value}`,
    },
  },
  'spacer-v': {
    height: {
      val: { value: `{${prefix4g}.size.content.spacing.val.value}` },
      xs: { value: `{${prefix4g}.size.content.spacing.xs.value}` },
    },
  },
};
