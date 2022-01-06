const {
  globalPrefix: prefix4g,
  compPrefix: prefix4c,
} = require('../../../utils/globalConfig');

module.exports = {
  //   height: { value: `3.125rem` }, // 50px
  //   'padding-x': { value: `0.625rem` }, // 10px
  //   'border-width': { value: `{${prefix4g}.size.base.border-width.value}` },
  'bg-color': { value: `{${prefix4g}.color.dark.dim.val.value}` },
  //   'border-color': {
  //     value: `{${prefix4g}.color.black.val.value}`,
  //     modify: [{ type: `setAlpha`, amount: `0.2` }],
  //   },
  //   'box-shadow': { value: `none` },
  //   'fixed-bottom': {
  //     height: { value: `{${prefix4c}.navbar.height.value}` },
  //     'box-shadow': { value: `none` },
  //   },
  //   'static-bottom': {
  //     'box-shadow': {
  //       value: `{${prefix4c}.navbar.fixed-bottom.box-shadow.value}`,
  //     },
  //   },
  //   container: {
  //     'padding-x': { value: `1.25rem` }, // 20px, var(--content-and-card-spacing) - var(--navbar-horizontal-padding)
  //     xs: {
  //       'padding-x': { value: `0.625rem` }, // 10px
  //     },
  //   },
  //   content: {
  //     'margin-x': { value: `1rem` },
  //   },
  //   'text-color': { value: `{${prefix4g}.color.base.text.light.value}` },
  link: {
    // 'padding-x': { value: `{${prefix4c}.navbar.content.margin-x.value}` }, // 16px
    // 'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
    // 'bg-color': { value: `transparent` },
    // hover: {
    //   'text-color': { value: `{${prefix4g}.color.brand.primary.val.value}` },
    //   'bg-color': { value: `${prefix4c}.navbar.link.bg-color.value` },
    // },
    // active: {
    //   'text-color': { value: `{${prefix4g}.color.brand.primary.val.value}` },
    //   'bg-color': { value: `${prefix4c}.navbar.link.bg-color.value` },
    // },
  },
  //   brand: {
  //     'font-size': { value: `1.25rem` },
  //     'font-weight': { value: `500` },
  //     image: {
  //       height: { value: `1.375rem` }, // 22px
  //       'margin-right': { value: `0.625rem` },
  //     },
  //     'text-color': { value: `{${prefix4g}.color.base.text.val.value}` },
  //   },
  //   'action-button': {
  //     width: { value: `2.25rem` },
  //     'padding-x': { value: `0` },
  //   },
  //   input: {
  //     'min-width': { value: `7.5rem` }, // 120
  //     xs: {
  //       'min-width': { value: `6.25rem` }, // 100
  //     },
  //   },
  //   'input-group': {
  //     'min-width': { value: `12.5rem` }, // 200
  //     xs: {
  //       'min-width': { value: `11.25rem` }, // 180
  //     },
  //   },
};
