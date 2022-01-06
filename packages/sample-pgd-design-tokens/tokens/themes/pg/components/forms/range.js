const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../../utils/globalConfig');

module.exports = {
  height: { value: `1.875rem` }, // 30
  'border-radius': { value: `{${prefix4g}.size.base.border-radius.value}` },
  invalid: {
    'box-shadow': {
      value: `0 0 0 0.0625rem {${prefix4g}.color.semantic.danger.val.value}`,
      replaceRefs: `all`,
    },
  },
  'slider-track': {
    height: { value: `0.375rem` }, // 6
    'border-width': { value: `0` },
    'border-radius': {
      value: `{${prefix4c}.form-range.slider-track.height.value}`,
    },
    'bg-color': {
      value: `{${prefix4g}.color.black.val.value}`,
      modify: [{ type: `setAlpha`, amount: 0.1 }],
    },
    'border-color': { value: `transparent` },
    'box-shadow': { value: `none` },
    hover: {
      'bg-color': {
        value: `{${prefix4c}.form-range.slider-track.bg-color.value}`,
      },
      'border-color': {
        value: `{${prefix4c}.form-range.slider-track.border-color.value}`,
      },
      'box-shadow': {
        value: `{${prefix4c}.form-range.slider-track.box-shadow.value}`,
      },
    },
    focus: {
      'bg-color': {
        value: `{${prefix4c}.form-range.slider-track.bg-color.value}`,
      },
      'border-color': {
        value: `{${prefix4c}.form-range.slider-track.border-color.value}`,
      },
      'box-shadow': {
        value: `{${prefix4c}.form-range.slider-track.box-shadow.value}`,
      },
    },
    disabled: {
      'bg-color': {
        value: `{${prefix4c}.form-range.slider-track.bg-color.value}`,
      },
      'border-color': {
        value: `{${prefix4c}.form-range.slider-track.border-color.value}`,
      },
      'box-shadow': {
        value: `{${prefix4c}.form-range.slider-track.box-shadow.value}`,
      },
    },
  },
  'slider-thumb': {
    width: { value: `1.25rem` },
    height: { value: `{${prefix4c}.form-range.slider-thumb.width.value}` },
    'border-width': { value: `0.125rem` },
    'border-radius': { value: `50%` },
    'bg-color': { value: `{${prefix4g}.color.white.val.value}` },
    'border-color': {
      value: `{${prefix4g}.color.black.val.value}`,
      modify: [{ type: `setAlpha`, amount: 0.3 }],
    },
    'box-shadow': { value: `none` },
    hover: {
      'bg-color': {
        value: `{${prefix4c}.form-range.slider-thumb.bg-color.value}`,
      },
      'border-color': {
        value: `{${prefix4g}.color.black.val.value}`,
        modify: [{ type: `setAlpha`, amount: 0.4 }],
      },
      'box-shadow': {
        value: `{${prefix4c}.form-range.slider-thumb.box-shadow.value}`,
      },
    },
    focus: {
      'bg-color': {
        value: `{${prefix4c}.form-range.slider-thumb.bg-color.value}`,
      },
      'border-color': { value: `{${prefix4g}.color.brand.primary.val.value}` },
      'box-shadow-color': {
        value: `{${prefix4g}.color.brand.primary.val.value}`,
        modify: [{ type: `setAlpha`, amount: 0.3 }],
      },
      'box-shadow': {
        value: `0 0 0 0.3125rem {${prefix4c}.form-range.slider-thumb.focus.box-shadow-color.value}`,
        replaceRefs: `all`,
      },
    },
    disabled: {
      'bg-color': { value: `{${prefix4g}.color.gray.val.value}` },
      'border-color': {
        value: `{${prefix4c}.form-range.slider-thumb.disabled.bg-color.value}`,
      },
      'box-shadow': { value: `none` },
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
