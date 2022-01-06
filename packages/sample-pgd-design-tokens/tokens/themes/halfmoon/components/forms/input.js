const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../../utils/globalConfig');

module.exports = {
  height: { value: `2rem` }, // 32
  'padding-x': { value: `0.5rem` },
  'border-radius': { value: `{${prefix4g}.size.base.border-radius.value}` },
  'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
  sm: {
    height: { value: `1.625rem` }, // 26
    'padding-x': { value: `{${prefix4c}.form-input.padding-x.value}` },
    'font-size': { value: `0.75rem` },
  },
  lg: {
    height: { value: `2.5rem` }, // 40
    'padding-x': { value: `{${prefix4c}.form-input.padding-x.value}` },
    'font-size': { value: `1.125rem` },
  },
  textarea: {
    'line-height': { value: `{${prefix4g}.size.base.line-height.value}` },
  },
  placeholder: {
    'text-color': {
      value: `{${prefix4g}.color.black.val.value}`,
      modify: [{ type: `setAlpha`, amount: 0.35 }],
    },
  },
  'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
  'bg-color': { value: `{${prefix4g}.color.white.val.value}` },
  'border-color': {
    value: `{${prefix4g}.color.black.val.value}`,
    modify: [{ type: `setAlpha`, amount: 0.2 }],
  },
  'box-shadow': { value: `none` },
  hover: {
    'text-color': { value: `{${prefix4c}.form-input.text-color.value}` },
    'bg-color': { value: `{${prefix4c}.form-input.bg-color.value}` },
    'border-color': {
      value: `{${prefix4g}.color.black.val.value}`,
      modify: [{ type: `setAlpha`, amount: 0.3 }],
    },
    'box-shadow': { value: `{${prefix4c}.form-input.box-shadow.value}` },
  },
  focus: {
    'text-color': { value: `{${prefix4c}.form-input.text-color.value}` },
    'bg-color': { value: `{${prefix4c}.form-input.bg-color.value}` },
    'border-color': { value: `{${prefix4c}.form-input.border-color.value}` },
    'box-shadow-color': {
      value: `{${prefix4g}.color.brand.primary.val.value}`,
      modify: [{ type: `setAlpha`, amount: 0.6 }],
    },
    'box-shadow': {
      value: `0 0 0 0.125rem {${prefix4c}.form-input.focus.box-shadow-color.value}`,
      replaceRefs: `all`,
    },
  },
  disabled: {
    'text-color': { value: `{${prefix4c}.form-input.text-color.value}` },
    'bg-color': { value: `{${prefix4g}.color.gray.light.val.value}` },
    'border-color': { value: `{${prefix4c}.form-input.border-color.value}` },
    'box-shadow': { value: `none` },
  },
  invalid: {
    placeholder: {
      'text-color': {
        value: `{${prefix4c}.form-input.placeholder.text-color.value}`,
      },
    },
    'text-color': { value: `{${prefix4c}.form-input.text-color.value}` },
    'bg-color': { value: `{${prefix4c}.form-input.bg-color.value}` },
    'border-color': {
      value: `{${prefix4g}.color.semantic.danger.light.value}`,
    },
    'box-shadow': { value: `{${prefix4c}.form-input.box-shadow.value}` },
    hover: {
      'text-color': {
        value: `{${prefix4c}.form-input.hover.text-color.value}`,
      },
      'bg-color': { value: `{${prefix4c}.form-input.hover.bg-color.value}` },
      'border-color': {
        value: `{${prefix4c}.form-input.invalid.border-color.value}`,
      },
      'box-shadow': {
        value: `{${prefix4c}.form-input.invalid.box-shadow.value}`,
      },
    },
    focus: {
      'text-color': {
        value: `{${prefix4c}.form-input.focus.text-color.value}`,
      },
      'bg-color': { value: `{${prefix4c}.form-input.focus.bg-color.value}` },
      'border-color': {
        value: `{${prefix4c}.form-input.invalid.border-color.value}`,
      },
      'box-shadow-color': {
        value: `{${prefix4g}.color.semantic.danger.val.value}`,
        modify: [{ type: `setAlpha`, amount: 0.2 }],
      },
      'box-shadow': {
        value: `0 0 0 0.125rem {${prefix4c}.form-input.invalid.focus.box-shadow-color.value}`,
        replaceRefs: `all`,
      },
    },
  },
  // input-group
  group: {
    text: {
      'padding-x': { value: `{${prefix4c}.form-input.padding-x.value}` },
      'border-width': { value: `{${prefix4c}.form-input.border-width.value}` },
      'border-radius': {
        value: `{${prefix4c}.form-input.border-radius.value}`,
      },
      sm: {
        'padding-x': { value: `{${prefix4c}.form-input.sm.padding-x.value}` },
        'font-size': { value: `{${prefix4c}.form-input.sm.font-size.value}` },
      },
      lg: {
        'padding-x': { value: `{${prefix4c}.form-input.lg.padding-x.value}` },
        'font-size': { value: `{${prefix4c}.form-input.lg.font-size.value}` },
      },
      'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
      'bg-color': { value: `{${prefix4g}.color.gray.val.value}` },
      'border-color': { value: `{${prefix4c}.form-input.border-color.value}` },
    },
    button: {
      'border-color': { value: `{${prefix4c}.button.border-color.value}` },
      hover: {
        'border-color': {
          value: `{${prefix4c}.button.hover.border-color.value}`,
        },
      },
      focus: {
        'border-color': {
          value: `{${prefix4c}.button.focus.border-color.value}`,
        },
      },
    },
  },
};
