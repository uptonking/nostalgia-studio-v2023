const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../../utils/globalConfig');

module.exports = {
  width: { value: `2rem` }, // 32
  height: { value: `1.125rem` }, // 18
  'line-height': { value: `{${prefix4c}.form-switcher.height.value}` },
  label: { 'padding-left': { value: `2.5rem` } }, // 40
  'label-blank': {
    'padding-left': { value: `{${prefix4c}.form-switcher.width.value}` },
  },
  'border-radius': { value: `{${prefix4c}.form-switcher.height.value}` },
  'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
  'form-group': { margin: { value: `0.5rem 0 0 0 ` } },
  'bg-color': { value: `{${prefix4c}.form-checkbox.bg-color.value}` },
  'border-color': { value: `{${prefix4c}.form-checkbox.border-color.value}` },
  'box-shadow': { value: `{${prefix4c}.form-checkbox.box-shadow.value}` },

  checked: {
    'bg-color': { value: `{${prefix4c}.form-checkbox.checked.bg-color.value}` },
    'border-color': {
      value: `{${prefix4c}.form-checkbox.checked.border-color.value}`,
    },
    'box-shadow': {
      value: `{${prefix4c}.form-checkbox.checked.box-shadow.value}`,
    },
    focus: {
      'border-color': {
        value: `{${prefix4c}.form-checkbox.checked.focus.border-color.value}`,
      },
      'box-shadow': {
        value: `{${prefix4c}.form-checkbox.checked.focus.box-shadow.value}`,
      },
    },
  },
  hover: {
    'bg-color': { value: `{${prefix4c}.form-checkbox.hover.bg-color.value}` },
    'border-color': {
      value: `{${prefix4c}.form-checkbox.hover.border-color.value}`,
    },
    'box-shadow': {
      value: `{${prefix4c}.form-checkbox.hover.box-shadow.value}`,
    },
  },
  focus: {
    'border-color': {
      value: `{${prefix4c}.form-checkbox.focus.border-color.value}`,
    },
    'box-shadow': {
      value: `{${prefix4c}.form-checkbox.focus.box-shadow.value}`,
    },
  },
  slider: {
    left: { value: `0.25rem` }, // 4
    top: { value: `0.1875rem` }, // 3
    width: { value: `0.75rem` },
    height: { value: `0.75rem` },
    'border-width': { value: `0` },
    'border-radius': { value: `50%` },

    'bg-color': {
      value: `{${prefix4g}.color.black.val.value}`,
      modify: [{ type: `setAlpha`, amount: 0.2 }],
    },
    'border-color': { value: `transparent` },
    'box-shadow': { value: `none` },
    checked: {
      left: { value: `1rem` },
      top: { value: `{${prefix4c}.form-switcher.slider.top.value}` },
      'bg-color': {
        value: `{${prefix4c}.form-checkbox.checkmark.color.value}`,
      },
      'border-color': { value: `transparent` },
      'box-shadow': {
        value: `{${prefix4c}.form-checkbox.checkmark.box-shadow.value}`,
      },
    },
  },
};
