const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../../utils/globalConfig');

module.exports = {
  //   width: { value: `1.125rem` }, // 18
  //   height: { value: `1.125rem` },
  //   'line-height': { value: `{${prefix4c}.form-checkbox.height.value}` },
  //   label: { 'padding-left': { value: `1.5rem` } },
  //   'label-blank': {
  //     'padding-left': { value: `{${prefix4c}.form-checkbox.height.value}` },
  //   },
  //   'border-radius': { value: `{${prefix4g}.size.base.border-radius.value}` },
  //   'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
  'bg-color': {
    value: `{${prefix4g}.color.white.val.value}`,
    modify: [{ type: `setAlpha`, amount: 0 }],
  },
  'border-color': {
    value: `{${prefix4g}.color.white.val.value}`,
    modify: [{ type: `setAlpha`, amount: 0.15 }],
  },
  //   'box-shadow': { value: `none` },
  //   checked: {
  //     'bg-color': { value: `{${prefix4g}.color.brand.primary.val.value}` },
  //     'border-color': { value: `{${prefix4g}.color.brand.primary.val.value}` },
  //     'box-shadow': { value: `{${prefix4c}.form-checkbox.box-shadow.value}` },
  //     focus: {
  //       'border-color': {
  //         value: `{${prefix4c}.form-checkbox.checked.border-color.value}`,
  //       },
  //       'box-shadow-color': {
  //         value: `{${prefix4g}.color.brand.primary.val.value}`,
  //         modify: [{ type: `setAlpha`, amount: 0.63 }],
  //       },
  //       'box-shadow': {
  //         value: `0 0 0 0.0.1875rem {${prefix4c}.form-checkbox.checked.focus.box-shadow-color.value}`,
  //         replaceRefs: `all`,
  //       },
  //     },
  //   },
  //   hover: {
  //     'bg-color': { value: `{${prefix4c}.form-checkbox.bg-color.value}` },
  //     'border-color': {
  //       value: `{${prefix4g}.color.black.val.value}`,
  //       modify: [{ type: `setAlpha`, amount: 0.4 }],
  //     },
  //     'box-shadow': { value: `{${prefix4c}.form-checkbox.box-shadow.value}` },
  //   },
  //   focus: {
  //     'border-color': {
  //       value: `{${prefix4c}.form-input.focus.border-color.value}`,
  //     },
  //     'box-shadow': { value: `{${prefix4c}.form-input.focus.box-shadow.value}` },
  //   },
  //   checkmark: {
  //     left: { value: `0.4375rem` }, // 7
  //     top: { value: `0.25rem` },
  //     width: { value: `0.25rem` },
  //     height: { value: `0.5rem` },
  //     'border-width': { value: `0 0.125rem 0.125rem 0` },
  //     transform: { value: `rotate(45deg) scale(1.15)` },
  //     color: { value: `{${prefix4g}.color.text.on-primary-color-bg.value}` },
  //     'box-shadow': { value: `none` },
  //   },
};
