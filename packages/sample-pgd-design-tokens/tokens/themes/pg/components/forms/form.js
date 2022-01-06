const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../../utils/globalConfig');

module.exports = {
  label: { 'margin-bottom': { value: `0.375rem` } }, // 6
  legend: {
    'margin-bottom': { value: `{${prefix4c}.form.label.margin-bottom.value}` },
  },
  group: { 'margin-bottom': { value: `1.25rem` } }, // 20
  text: {
    'padding-top': { value: `0.5rem` }, // 8
    'padding-bottom': { value: `{${prefix4c}.form.text.padding-top.value}` },
    'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
    'border-style': { value: `dotted` },
    'border-color': {
      value: `{${prefix4g}.color.black.val.value}`,
      modify: [{ type: `setAlpha`, amount: 0.2 }],
    },
    'text-color': { value: `{${prefix4g}.color.base.text.light.value}` },
    'font-size': { value: `{${prefix4g}.size.base.font-size.value}` },
  },
  required: {
    'text-color': { value: `{${prefix4g}.color.semantic.danger.val.value}` },
  },
  invalid: {
    'padding-top': { value: `0.5rem` }, // 8
    'padding-bottom': { value: `{${prefix4c}.form.invalid.padding-top.value}` },
    'text-color': { value: `{${prefix4g}.color.semantic.danger.val.value}` },
    'font-size': { value: `{${prefix4g}.size.base.font-size.value}` },
  },
  row: {
    'margin-bottom': { value: `{${prefix4c}.form.group.margin-bottom.value}` },
  },
  col: {
    'margin-bottom': { value: `{${prefix4c}.form.group.margin-bottom.value}` },
    'padding-x': { value: `0.625rem` },
  },
  inline: {
    'margin-x': { value: `0.625rem` },
  },
};
