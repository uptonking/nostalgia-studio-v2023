const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../utils/globalConfig');

module.exports = {
  width: { value: `16.25rem` }, // 260px
  'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
  'bg-color': { value: `{${prefix4g}.color.white.val.value}` },
  'border-color': {
    value: `{${prefix4g}.color.black.val.value}`,
    modify: [{ type: `setAlpha`, amount: `0.2` }],
  },
  'box-shadow': { value: `none` },
  overlay: {
    'bg-color': {
      value: `{${prefix4g}.color.black.val.value}`,
      modify: [{ type: `setAlpha`, amount: `0.75` }],
    },
  },
  menu: {
    'margin-y': { value: `1.5rem` }, // 24px
  },
  item: {
    'spacing-y': { value: `0.375rem` }, // 6px
    'spacing-x': { value: `1.5rem` }, // 24px
  },
  content: {
    padding: { value: `0` },
    'margin-y': { value: `{${prefix4c}.sidebar.menu.margin-y.value}` },
    'margin-x': { value: `{${prefix4c}.sidebar.item.spacing-x.value}` },
  },
  link: {
    'min-height': { value: `2rem` },
    'padding-y': { value: `{${prefix4c}.sidebar.item.spacing-y.value}` },
    'padding-x': { value: `{${prefix4c}.sidebar.item.spacing-x.value}` },
    margin: { value: `0` },
    'border-width': { value: `0` },
    'border-radius': { value: `0` },
    'border-color': { value: `transparent` },
    'bg-color': { value: `transparent` },
    'text-color': { value: `{${prefix4g}.color.base.text.light.value}` },
    hover: {
      'border-color': { value: `transparent` },
      'bg-color': { value: `transparent` },
      'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
    },
    focus: {
      'box-shadow': {
        value: `{${prefix4g}.size.hyperlink.focus.box-shadow.value}`,
      },
      outline: {
        value: `{${prefix4g}.size.hyperlink.focus.outline.value}`,
      },
    },
    active: {
      'border-color': { value: `transparent` },
      'bg-color': { value: `transparent` },
      'text-color': { value: `{${prefix4g}.color.brand.primary.val.value}` },
      hover: {
        'border-color': { value: `transparent` },
        'bg-color': { value: `transparent` },
        'text-color': {
          value: `{${prefix4g}.color.brand.primary.light.value}`,
        },
      },
      focus: {
        'box-shadow': {
          value: `{${prefix4g}.size.hyperlink.focus.box-shadow.value}`,
        },
        outline: {
          value: `{${prefix4g}.size.hyperlink.focus.outline.value}`,
        },
      },
    },
  },
  divider: {
    height: { value: `0.0625rem` }, // 1px
    padding: { value: `0` },
    'margin-y': { value: `{${prefix4c}.sidebar.item.spacing-y.value}` },
    'margin-x': { value: `{${prefix4c}.sidebar.item.spacing-x.value}` },
    'bg-color': { value: `{${prefix4g}.color.horizontal-rule.value}` },
  },
  title: {
    padding: { value: `0` },
    'margin-y': { value: `{${prefix4c}.sidebar.item.spacing-y.value}` },
    'margin-x': { value: `{${prefix4c}.sidebar.item.spacing-x.value}` },
    'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
    'font-size': { value: `1rem` },
    'font-weight': {
      value: `{${prefix4g}.size.content.title.font-weight.value}`,
    },
  },
  icon: {
    width: { value: `2rem` },
    height: { value: `2rem` },
    'margin-right': { value: `0.0625rem` },
    'border-width': { value: `0` },
    'border-radius': { value: `{${prefix4g}.size.base.border-radius.value}` },
    'border-color': { value: `transparent` },
    'bg-color': {
      value: `{${prefix4g}.color.black.val.value}`,
      modify: [{ type: `setAlpha`, amount: `0.05` }],
    },
    'text-color': { value: `{${prefix4g}.color.base.text.light.value}` },
    hover: {
      'border-color': {
        value: `{${prefix4c}.sidebar.icon.border-color.value}`,
      },
      'bg-color': { value: `{${prefix4c}.sidebar.icon.bg-color.value}` },
      'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
    },
    active: {
      'border-color': {
        value: `{${prefix4c}.sidebar.icon.border-color.value}`,
      },
      'bg-color': { value: `{${prefix4c}.sidebar.icon.bg-color.value}` },
      'text-color': { value: `{${prefix4c}.sidebar.icon.text-color.value}` },
      hover: {
        'border-color': {
          value: `{${prefix4c}.sidebar.icon.hover.border-color.value}`,
        },
        'bg-color': {
          value: `{${prefix4c}.sidebar.icon.hover.bg-color.value}`,
        },
        'text-color': {
          value: `{${prefix4c}.sidebar.icon.hover.text-color.value}`,
        },
      },
    },
  },
  brand: {
    padding: { value: `0` },
    'margin-y': { value: `{${prefix4c}.sidebar.item.spacing-y.value}` },
    'margin-x': { value: `{${prefix4c}.sidebar.item.spacing-x.value}` },
    'font-size': { value: `{${prefix4c}.navbar.brand.font-size.value}` },
    'font-weight': {
      value: `{${prefix4c}.navbar.brand.font-weight.value}`,
    },
    image: {
      height: { value: `{${prefix4c}.navbar.brand.image.height.value}` },
      'margin-right': {
        value: `{${prefix4c}.navbar.brand.image.margin-right.value}`,
      },
    },
    'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
    hover: {
      'text-color': { value: `{${prefix4g}.color.base.text.light.value}` },
    },
    focus: {
      'box-shadow': {
        value: `{${prefix4g}.size.hyperlink.focus.box-shadow.value}`,
      },
      outline: {
        value: `{${prefix4g}.size.hyperlink.focus.outline.value}`,
      },
    },
  },
};
