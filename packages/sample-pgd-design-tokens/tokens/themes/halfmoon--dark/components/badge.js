const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../utils/globalConfig');

module.exports = {
  //   padding: { value: `0.125rem 0.5rem` },
  //   'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
  //   'border-radius': { value: `{${prefix4g}.size.base.border-radius.value}` },
  //   'pill-border-radius': { value: `1.875rem` }, // 30
  //   'font-size': { value: `0.75rem` }, // 12
  //   'line-height': { value: `1.2` },
  //   'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
  'bg-color': {
    value: `{${prefix4g}.color.white.val.value}`,
    modify: [{ type: `setAlpha`, amount: 0 }],
  },
  'border-color': {
    value: `{${prefix4g}.color.white.val.value}`,
    modify: [{ type: `setAlpha`, amount: 0.2 }],
  },
  //   primary: {
  //     'text-color': {
  //       value: `{${prefix4g}.color.text.on-primary-color-bg.value}`,
  //     },
  //     'bg-color': { value: `{${prefix4g}.color.brand.primary.val.value}` },
  //     'border-color': { value: `{${prefix4g}.color.brand.primary.val.value}` },
  //   },
  //   success: {
  //     'text-color': {
  //       value: `{${prefix4g}.color.text.on-success-color-bg.value}`,
  //     },
  //     'bg-color': { value: `{${prefix4g}.color.semantic.success.val.value}` },
  //     'border-color': { value: `{${prefix4g}.color.semantic.success.val.value}` },
  //   },
  //   danger: {
  //     'text-color': {
  //       value: `{${prefix4g}.color.text.on-danger-color-bg.value}`,
  //     },
  //     'bg-color': { value: `{${prefix4g}.color.semantic.danger.val.value}` },
  //     'border-color': { value: `{${prefix4g}.color.semantic.danger.val.value}` },
  //   },
  //   link: {
  //     hover: {
  //       'text-color': { value: `{${prefix4c}.badge.text-color.value}` },
  //       'bg-color': { value: `{${prefix4g}.color.gray.lighter.val.value}` },
  //       'border-color': { value: `{${prefix4c}.badge.border-color.value}` },
  //     },
  //     focus: {
  //       'box-shadow': { value: `{${prefix4c}.button.focus.box-shadow.value}` },
  //       outline: { value: `{${prefix4c}.button.focus.outline.value}` },
  //     },
  //     group: {
  //       focus: {
  //         'border-radius': { value: `${prefix4c}.badge.border-radius.value` },
  //         'box-shadow-color': {
  //           value: `{${prefix4g}.color.brand.primary.val.value}`,
  //           modify: [{ type: `setAlpha`, amount: `0.6` }],
  //         },
  //         'box-shadow': {
  //           value: `0 0 0 0.1875rem {${prefix4c}.badge.link.group.focus.box-shadow-color.value}`,
  //           replaceRefs: 'all',
  //         },
  //         outline: { value: `none` },
  //       },
  //     },
  //   },
};
