const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../utils/globalConfig');

module.exports = {
  height: { value: `2rem` }, // 32
  padding: { value: `0 1rem` },
  'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
  'border-radius': { value: `{${prefix4g}.size.base.border-radius.value}` },
  'text-color': { value: `{${prefix4g}.color.base.text.light.value}` },
  'bg-color': { value: `{${prefix4g}.color.white.val.value}` },
  'border-color': {
    value: `{${prefix4g}.color.black.val.value}`,
    modify: [{ type: `setAlpha`, amount: `0.2` }],
  },
  'box-shadow-color': {
    value: `{${prefix4g}.color.black.val.value}`,
    modify: [{ type: `setAlpha`, amount: `0.05` }],
  },
  'box-shadow': {
    value: `0 0.125rem 0 {${prefix4c}.button.box-shadow-color.value}`,
    replaceRefs: 'all',
  },
  'font-size': { value: '2rem' },
  'text-align': { value: 'center' },
  'line-height': { value: `{${prefix4c}.button.height.value}` },
  hover: {
    'text-color': { value: `{${prefix4c}.button.text-color.value}` },
    'bg-color': { value: `{${prefix4g}.color.gray.lighter.val.value}` },
    'border-color': { value: `{${prefix4c}.button.border-color.value}` },
    'box-shadow': { value: `{${prefix4c}.button.box-shadow.value}` },
  },
  focus: {
    'text-color': { value: `{${prefix4c}.button.text-color.value}` },
    'bg-color': { value: `{${prefix4c}.button.bg-color.value}` },
    'border-color': { value: `{${prefix4c}.button.border-color.value}` },
    'box-shadow-color': {
      value: `{${prefix4g}.color.brand.primary.val.value}`,
      modify: [{ type: `setAlpha`, amount: `0.6` }],
    },
    'box-shadow': {
      value: `0 0 0 0.125rem {${prefix4c}.button.focus.box-shadow-color.value}`,
      replaceRefs: 'all',
    },
    outline: { value: `none` },
  },
  disabled: {
    opacity: { value: `0.6` },
    // 'text-color': { value: `{${prefix4c}.button.text-color.value}` },
    // 'bg-color': { value: `{${prefix4c}.button.bg-color.value}` },
    // 'border-color': { value: `{${prefix4c}.button.border-color.value}` },
    // 'box-shadow': { value: `none` },
  },
  primary: {
    'text-color': {
      value: `{${prefix4g}.color.text.on-primary-color-bg.value}`,
    },
    'bg-color': { value: `{${prefix4g}.color.brand.primary.val.value}` },
    'border-color': { value: `transparent`, outputAsItIs: true },
    'box-shadow': { value: `{${prefix4c}.button.box-shadow.value}` },
    hover: {
      'text-color': { value: `{${prefix4c}.button.primary.text-color.value}` },
      'bg-color': { value: `{${prefix4g}.color.brand.primary.light.value}` },
      'border-color': {
        value: `{${prefix4c}.button.primary.border-color.value}`,
      },
      'box-shadow': { value: `{${prefix4c}.button.primary.box-shadow.value}` },
    },
    focus: {
      'text-color': { value: `{${prefix4c}.button.primary.text-color.value}` },
      'bg-color': { value: `{${prefix4c}.button.primary.bg-color.value}` },
      'border-color': {
        value: `{${prefix4c}.button.primary.border-color.value}`,
      },
      'box-shadow-color': {
        value: `{${prefix4g}.color.brand.primary.val.value}`,
        modify: [{ type: `setAlpha`, amount: `0.3` }],
      },
      'box-shadow': {
        value: `0 0 0 0.1875rem {${prefix4c}.button.primary.focus.box-shadow-color.value}`,
        replaceRefs: 'all',
      },
      outline: { value: `{${prefix4c}.button.focus.outline.value}` },
    },
    disabled: {
      // 'text-color': { value: `{${prefix4c}.button.primary.text-color.value}` },
      // 'bg-color': { value: `{${prefix4c}.button.primary.bg-color.value}` },
      // 'border-color': {
      //   value: `{${prefix4c}.button.primary.border-color.value}`,
      // },
      // 'box-shadow': { value: `none` },
    },
  },
  secondary: {
    'text-color': {
      value: `{${prefix4g}.color.text.on-secondary-color-bg.value}`,
    },
    'bg-color': { value: `{${prefix4g}.color.brand.secondary.val.value}` },
    'border-color': { value: `transparent`, outputAsItIs: true },
    'box-shadow': { value: `{${prefix4c}.button.box-shadow.value}` },
    hover: {
      'text-color': {
        value: `{${prefix4c}.button.secondary.text-color.value}`,
      },
      'bg-color': { value: `{${prefix4g}.color.brand.secondary.light.value}` },
      'border-color': {
        value: `{${prefix4c}.button.secondary.border-color.value}`,
      },
      'box-shadow': {
        value: `{${prefix4c}.button.secondary.box-shadow.value}`,
      },
    },
    focus: {
      'text-color': {
        value: `{${prefix4c}.button.secondary.text-color.value}`,
      },
      'bg-color': { value: `{${prefix4c}.button.secondary.bg-color.value}` },
      'border-color': {
        value: `{${prefix4c}.button.secondary.border-color.value}`,
      },
      'box-shadow-color': {
        value: `{${prefix4g}.color.brand.secondary.val.value}`,
        modify: [{ type: `setAlpha`, amount: `0.3` }],
      },
      'box-shadow': {
        value: `0 0 0 0.1875rem {${prefix4c}.button.secondary.focus.box-shadow-color.value}`,
        replaceRefs: 'all',
      },
      outline: { value: `{${prefix4c}.button.focus.outline.value}` },
    },
    disabled: {
      'text-color': { value: `{${prefix4c}.button.primary.text-color.value}` },
      'bg-color': { value: `{${prefix4c}.button.primary.bg-color.value}` },
      'border-color': {
        value: `{${prefix4c}.button.primary.border-color.value}`,
      },
      'box-shadow': { value: `none` },
    },
  },
  success: {
    'text-color': {
      value: `{${prefix4g}.color.text.on-success-color-bg.value}`,
    },
    'bg-color': { value: `{${prefix4g}.color.semantic.success.val.value}` },
    'border-color': { value: `transparent`, outputAsItIs: true },
    'box-shadow': { value: `{${prefix4c}.button.box-shadow.value}` },
    hover: {
      'text-color': { value: `{${prefix4c}.button.success.text-color.value}` },
      'bg-color': { value: `{${prefix4g}.color.semantic.success.light.value}` },
      'border-color': {
        value: `{${prefix4c}.button.success.border-color.value}`,
      },
      'box-shadow': { value: `{${prefix4c}.button.success.box-shadow.value}` },
    },
    focus: {
      'text-color': { value: `{${prefix4c}.button.success.text-color.value}` },
      'bg-color': { value: `{${prefix4c}.button.success.bg-color.value}` },
      'border-color': {
        value: `{${prefix4c}.button.success.border-color.value}`,
      },
      'box-shadow-color': {
        value: `{${prefix4g}.color.semantic.success.val.value}`,
        modify: [{ type: `setAlpha`, amount: `0.3` }],
      },
      'box-shadow': {
        value: `0 0 0 0.1875rem {${prefix4c}.button.success.focus.box-shadow-color.value}`,
        replaceRefs: 'all',
      },
      outline: { value: `{${prefix4c}.button.focus.outline.value}` },
    },
    disabled: {
      // 'text-color': { value: `{${prefix4c}.button.success.text-color.value}` },
      // 'bg-color': { value: `{${prefix4c}.button.success.bg-color.value}` },
      // 'border-color': {
      //   value: `{${prefix4c}.button.success.border-color.value}`,
      // },
      // 'box-shadow': { value: `none` },
    },
  },
  danger: {
    'text-color': {
      value: `{${prefix4g}.color.text.on-danger-color-bg.value}`,
    },
    'bg-color': { value: `{${prefix4g}.color.semantic.danger.val.value}` },
    'border-color': { value: `transparent`, outputAsItIs: true },
    'box-shadow': { value: `{${prefix4c}.button.box-shadow.value}` },
    hover: {
      'text-color': { value: `{${prefix4c}.button.danger.text-color.value}` },
      'bg-color': { value: `{${prefix4g}.color.semantic.danger.light.value}` },
      'border-color': {
        value: `{${prefix4c}.button.danger.border-color.value}`,
      },
      'box-shadow': { value: `{${prefix4c}.button.danger.box-shadow.value}` },
    },
    focus: {
      'text-color': { value: `{${prefix4c}.button.danger.text-color.value}` },
      'bg-color': { value: `{${prefix4c}.button.danger.bg-color.value}` },
      'border-color': {
        value: `{${prefix4c}.button.danger.border-color.value}`,
      },
      'box-shadow-color': {
        value: `{${prefix4g}.color.semantic.danger.val.value}`,
        modify: [{ type: `setAlpha`, amount: `0.3` }],
      },
      'box-shadow': {
        value: `0 0 0 0.1875rem {${prefix4c}.button.danger.focus.box-shadow-color.value}`,
        replaceRefs: 'all',
      },
      outline: { value: `{${prefix4c}.button.focus.outline.value}` },
    },
    disabled: {
      // 'text-color': { value: `{${prefix4c}.button.danger.text-color.value}` },
      // 'bg-color': { value: `{${prefix4c}.button.danger.bg-color.value}` },
      // 'border-color': {
      //   value: `{${prefix4c}.button.danger.border-color.value}`,
      // },
      // 'box-shadow': { value: `none` },
    },
  },
  sm: {
    height: { value: `1.625rem` }, // 26
    padding: { value: `0 1rem` },
    'font-size': { value: `0.75rem` },
    'line-height': { value: `{${prefix4c}.button.sm.height.value}` },
  },
  lg: {
    height: { value: `2.5rem` }, // 40
    padding: { value: `0 1.25rem` },
    'font-size': { value: `1.125rem` },
    'line-height': { value: `{${prefix4c}.button.lg.height.value}` },
  },
  rounded: {
    'border-radius': {
      sm: { value: `{${prefix4c}.button.sm.height.value}` },
      md: { value: `{${prefix4c}.button.height.value}` },
      lg: { value: `{${prefix4c}.button.lg.height.value}` },
    },
  },
  link: {
    'text-color': { value: `{${prefix4g}.color.brand.primary.val.value}` },
    'bg-color': { value: `transparent` },
    'border-color': { value: `transparent` },
    'box-shadow': { value: `none` },
    hover: {
      'text-color': { value: `{${prefix4g}.color.brand.primary.light.value}` },
      'bg-color': { value: `{${prefix4c}.button.link.bg-color.value}` },
      'border-color': { value: `{${prefix4c}.button.link.border-color.value}` },
      'box-shadow': { value: `{${prefix4c}.button.link.box-shadow.value}` },
    },
    focus: {
      'text-color': { value: `{${prefix4c}.button.link.text-color.value}` },
      'bg-color': { value: `{${prefix4c}.button.link.bg-color.value}` },
      'border-color': { value: `{${prefix4c}.button.link.border-color.value}` },
      'box-shadow': { value: `{${prefix4c}.button.focus.box-shadow.value}` },
      outline: { value: `{${prefix4c}.button.focus.outline.value}` },
    },
  },
};
