const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../utils/globalConfig');

module.exports = {
  padding: { value: `0.625rem 0.875rem` },
  'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
  'border-color': { value: `{${prefix4g}.color.gray.dim.val.value}` },
  sm: { padding: { value: `0.375rem 0.625rem` } },
  md: { padding: { value: `0.75rem 1rem` } },
  lg: { padding: { value: `0.875rem 1.125rem` } },
  head: {
    cell: {
      'font-weight': { value: `700` },
    },
    row: {
      'border-bottom-border-width': {
        value: `{${prefix4c}.html-table.border-width.value}`,
      },
    },
  },
  foot: {
    row: {
      'border-top-border-width': {
        value: `{${prefix4c}.html-table.border-width.value}`,
      },
    },
  },
  caption: {
    'padding-y': { value: `0.625rem` },
    'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
    'border-style': { value: `dotted` },
    'text-color': { value: `{${prefix4g}.color.text.muted.value}` },
    'border-color': {
      value: `{${prefix4g}.color.black.val.value}`,
      modify: [{ type: `setAlpha`, amount: 0.2 }],
    },
  },
  striped: {
    'bg-color': {
      value: `{${prefix4g}.color.black.val.value}`,
      modify: [{ type: `setAlpha`, amount: 0.03 }],
    },
  },
  hoverable: {
    hover: {
      'bg-color': {
        value: `{${prefix4g}.color.black.val.value}`,
        modify: [{ type: `setAlpha`, amount: 0.06 }],
      },
    },
  },
  primary: {
    'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
    'bg-color': {
      value: `{${prefix4g}.color.brand.primary.val.value}`,
      modify: [{ type: `setAlpha`, amount: 0.2 }],
    },
    stripped: {
      'bg-color': {
        value: `{${prefix4g}.color.brand.primary.val.value}`,
        modify: [{ type: `setAlpha`, amount: 0.275 }],
      },
    },
    hoverable: {
      hover: {
        'bg-color': {
          value: `{${prefix4g}.color.brand.primary.val.value}`,
          modify: [{ type: `setAlpha`, amount: 0.35 }],
        },
      },
    },
  },
  active: {
    'text-color': {
      value: `{${prefix4c}.html-table.primary.text-color.value}`,
    },
    'bg-color': { value: `{${prefix4c}.html-table.primary.bg-color.value}` },
    stripped: {
      'bg-color': {
        value: `{${prefix4c}.html-table.primary.stripped.bg-color.value}`,
      },
    },
    hoverable: {
      hover: {
        'bg-color': {
          value: `{${prefix4c}.html-table.primary.hoverable.hover.bg-color.value}`,
        },
      },
    },
  },
};
