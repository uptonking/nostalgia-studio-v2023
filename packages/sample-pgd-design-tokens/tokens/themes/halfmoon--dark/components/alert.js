const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../utils/globalConfig');

module.exports = {
  //   padding: { value: `0.75rem 1.25rem` },
  //   'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
  //   'border-radius': { value: `{${prefix4g}.size.base.border-radius.value}` },
  //   'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
  'bg-color': { value: `{${prefix4g}.color.dark.light.val.value}` },
  'border-color': {
    value: `{${prefix4g}.color.black.val.value}`,
    modify: [{ type: `setAlpha`, amount: 0.25 }],
  },
  //   heading: {
  //     margin: { value: `0 0 0.375rem 0` },
  //     'font-size': { value: `1rem` }, // 16
  //     'font-weight': {
  //       value: `{${prefix4g}.size.content.title.font-weight.value}`,
  //     },
  //   },
  //   close: {
  //     padding: { value: `0.25rem 0.375rem` },
  //     'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
  //     'border-radius': { value: `{${prefix4c}.alert.border-radius.value}` },
  //     'font-size': { value: `1rem` }, // 16
  //     'line-height': { value: `1` },
  //     // 'text-color': { value: `inherit` },
  //     'text-color': { value: `{${prefix4c}.alert.text-color.value}` },
  //     'bg-color': { value: `transparent` },
  //     'border-color': { value: `transparent` },
  //     'box-shadow': { value: `none` },
  //     hover: {
  //       'text-color': { value: `{${prefix4c}.alert.close.text-color.value}` },
  //       'bg-color': { value: `{${prefix4c}.alert.close.bg-color.value}` },
  //       'border-color': { value: `{${prefix4c}.alert.close.border-color.value}` },
  //       'box-shadow': { value: `{${prefix4c}.alert.close.box-shadow.value}` },
  //     },
  //     focus: {
  //       'text-color': { value: `{${prefix4c}.alert.close.text-color.value}` },
  //       'bg-color': { value: `{${prefix4c}.alert.close.bg-color.value}` },
  //       // 'border-color': { value: `{${prefix4c}.alert.close.border-color.value}` },
  //       'border-color': { value: `currentColor` },
  //       'box-shadow': { value: `{${prefix4c}.alert.close.box-shadow.value}` },
  //       outline: { value: `none` },
  //     },
  //   },
  //   sticky: {
  //     top: { value: `0` },
  //     right: { value: `1.5rem` }, // 24
  //     width: { value: `16.875rem` }, // 270
  //     'box-shadow-color': {
  //       value: `{${prefix4g}.color.black.val.value}`,
  //       modify: [{ type: `setAlpha`, amount: 0.045 }],
  //     },
  //     'box-shadow': {
  //       value: `0 0.125rem 0 {${prefix4c}.alert.sticky.box-shadow-color.value}`,
  //       replaceRefs: `all`,
  //     },
  //   },
  //   primary: {
  //     'text-color': { value: `{${prefix4c}.alert.text-color.value}` },
  //     'bg-color': {
  //       value: `{${prefix4g}.color.brand.primary.lighter.value}`,
  //     },
  //     'border-color': { value: `{${prefix4g}.color.brand.primary.val.value}` },
  //   },
  //   success: {
  //     'text-color': { value: `{${prefix4c}.alert.text-color.value}` },
  //     'bg-color': {
  //       value: `{${prefix4g}.color.semantic.success.lighter.value}`,
  //     },
  //     'border-color': { value: `{${prefix4g}.color.semantic.success.val.value}` },
  //   },
  //   danger: {
  //     'text-color': { value: `{${prefix4c}.alert.text-color.value}` },
  //     'bg-color': {
  //       value: `{${prefix4g}.color.semantic.danger.lighter.value}`,
  //     },
  //     'border-color': { value: `{${prefix4g}.color.semantic.danger.val.value}` },
  //   },
};
