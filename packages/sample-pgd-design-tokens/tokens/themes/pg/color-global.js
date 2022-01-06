const { globalPrefix: prefix4g } = require('../../utils/globalConfig');

module.exports = {
  test: {
    // hue: { value: `0`, outputAsItIs: true },
    // hslstr: { value: `hsl(0, 0, 50%)` },
    // hslastr: { value: `hsl(0, 0, 50%, 0.5)` },
    // hslmodify: {
    //   value: `hsl(0, 0, 50%)`,
    //   modify: [{ type: `setAlpha`, amount: `0.5` }],
    // },
    // hexmodify: {
    //   value: `#808080`,
    //   modify: [{ type: `setAlpha`, amount: `0.5` }],
    // },
    // hslobjraw: {
    //   value: {
    //     h: 0,
    //     s: `0`,
    //     l: `50%`,
    //     a: `0.5`,
    //   },
    // },
    // hslobjwithref: {
    //   value: {
    //     h: `{${prefix4g}.color.test.hue.value}`,
    //     s: `0%`,
    //     l: `50%`,
    //   },
    // },
    // refedhsl: { value: `{${prefix4g}.color.test.hslobjwithref.value}` },
  },
  brand: {
    primary: {
      val: { value: `{${prefix4g}.color.palette.blue.val.value}` },
      light: { value: `{${prefix4g}.color.palette.blue.light.val.value}` },
      lighter: { value: `{${prefix4g}.color.palette.blue.lighter.val.value}` },
      dim: { value: `{${prefix4g}.color.palette.blue.dim.val.value}` },
      dimmer: { value: `{${prefix4g}.color.palette.blue.dimmer.val.value}` },
    },
    secondary: {
      val: { value: `{${prefix4g}.color.palette.yellow.val.value}` },
      light: { value: `{${prefix4g}.color.palette.yellow.light.val.value}` },
      lighter: {
        value: `{${prefix4g}.color.palette.yellow.lighter.val.value}`,
      },
      dim: { value: `{${prefix4g}.color.palette.yellow.dim.val.value}` },
      dimmer: { value: `{${prefix4g}.color.palette.yellow.dimmer.val.value}` },
    },
  },
  semantic: {
    success: {
      val: { value: `{${prefix4g}.color.palette.green.val.value}` },
      light: { value: `{${prefix4g}.color.palette.green.light.val.value}` },
      lighter: { value: `{${prefix4g}.color.palette.green.lighter.val.value}` },
      dim: { value: `{${prefix4g}.color.palette.green.dim.val.value}` },
      dimmer: { value: `{${prefix4g}.color.palette.green.dimmer.val.value}` },
    },
    info: { value: `` },
    warning: { value: `` },
    danger: {
      val: { value: `{${prefix4g}.color.palette.red.val.value}` },
      light: { value: `{${prefix4g}.color.palette.red.light.val.value}` },
      lighter: { value: `{${prefix4g}.color.palette.red.lighter.val.value}` },
      dim: { value: `{${prefix4g}.color.palette.red.dim.val.value}` },
      dimmer: { value: `{${prefix4g}.color.palette.red.dimmer.val.value}` },
    },
  },
  base: {
    text: {
      val: {
        value: `{${prefix4g}.color.black.hsl.value}`,
        modify: [{ type: `setAlpha`, amount: `0.85` }],
      },
      light: {
        value: `{${prefix4g}.color.black.hsl.value}`,
        modify: [{ type: `setAlpha`, amount: `0.7` }],
      },
    },
    body: {
      bg: {
        value: `{${prefix4g}.color.white.val.value}`,
      },
      'bg-image': {
        value: `none`,
        outputAsItIs: true,
      },
    },
  },
  'horizontal-rule': {
    value: `{${prefix4g}.color.black.hsl.value}`,
    modify: [{ type: `setAlpha`, amount: `0.05` }],
  },
  border: {
    lm: {
      value: `{${prefix4g}.color.black.hsl.value}`,
      modify: [{ type: `setAlpha`, amount: `0.2` }],
    },
    dm: {
      value: `{${prefix4g}.color.white.hsl.value}`,
      modify: [{ type: `setAlpha`, amount: `0.2` }],
    },
    light: { value: `{${prefix4g}.color.border.dm.value}` },
    dark: { value: `{${prefix4g}.color.border.lm.value}` },
  },
  text: {
    muted: {
      value: `{${prefix4g}.color.black.hsl.value}`,
      modify: [{ type: `setAlpha`, amount: `0.6` }],
    },
    'on-blue-color-bg': { value: `{${prefix4g}.color.white.val.value}` },
    'on-green-color-bg': { value: `{${prefix4g}.color.base.text.val.value}` },
    'on-yellow-color-bg': { value: `{${prefix4g}.color.base.text.val.value}` },
    'on-red-color-bg': { value: `{${prefix4g}.color.white.val.value}` },
    'on-primary-color-bg': {
      value: `{${prefix4g}.color.text.on-blue-color-bg.value}`,
    },
    'on-secondary-color-bg': {
      value: `{${prefix4g}.color.text.on-yellow-color-bg.value}`,
    },
    'on-success-color-bg': {
      value: `{${prefix4g}.color.text.on-green-color-bg.value}`,
    },
    'on-danger-color-bg': {
      value: `{${prefix4g}.color.text.on-red-color-bg.value}`,
    },
  },
  link: {
    text: {
      val: { value: `{${prefix4g}.color.brand.primary.val.value}` },
      hover: { value: `{${prefix4g}.color.brand.primary.light.value}` },
    },
  },
  hyperlink: {
    focus: {
      'box-shadow-color': {
        value: `{${prefix4g}.color.brand.primary.val.value}`,
        modify: [{ type: `setAlpha`, amount: 0.6 }],
      },
    },
  },
  shadow: {
    value: `{${prefix4g}.color.black.val.value}`,
    modify: [{ type: `setAlpha`, amount: `0.15` }],
  },
};
