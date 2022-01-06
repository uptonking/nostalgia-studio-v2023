const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../utils/globalConfig');

module.exports = {
  'padding-left': { value: `0` },
  'margin-y': { value: `0.625rem` }, // 10
  'style-position': { value: `inside` },
  item: {
    'margin-bottom': { value: `{${prefix4c}.html-list.margin-y.value}` },
  },
  nested: {
    'padding-left': { value: `1.5rem` },
  },
  ul: {
    'padding-left': { value: `0` },
    item: {
      // 'padding-left': { value: `1.5rem` }, // 24
      'padding-left': { value: `1.25rem` }, // 20
      bullet: {
        top: { value: `0.5rem` },
        left: { value: `0` },
        // width: { value: `0.5rem` }, // 8
        width: { value: `0.375rem` }, // 6
        height: { value: `{${prefix4c}.html-list.ul.item.bullet.width.value}` },
        'border-width': { value: `0` },
        'border-radius': { value: `50%` },
        'bg-color': {
          value: `{${prefix4g}.color.black.val.value}`,
          modify: [{ type: `setAlpha`, amount: 0.2 }],
        },
        'border-color': { value: `transparent` },
        'box-shadow': { value: `none` },
      },
    },
  },
  ol: {
    'padding-left': { value: `0` },
    item: {
      'padding-left': { value: `2.5rem` }, // 40
      numbering: {
        top: { value: `0.125rem` },
        left: { value: `0` },
        'min-width': { value: `1.25rem` }, // 20
        height: {
          value: `{${prefix4c}.html-list.ol.item.numbering.min-width.value}`,
        },
        padding: { value: `0.25rem` },
        'border-width': { value: `0` },
        'border-radius': {
          value: `{${prefix4c}.html-list.ol.item.numbering.min-width.value}`,
        },
        'font-size': { value: `0.75rem` },
        'line-height': { value: `1` },

        'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
        'bg-color': {
          value: `{${prefix4g}.color.black.val.value}`,
          modify: [{ type: `setAlpha`, amount: 0.15 }],
        },
        'border-color': { value: `transparent` },
        'box-shadow': { value: `none` },
      },
    },
  },
};
