const { globalPrefix: prefix4g } = require('../../utils/globalConfig');

module.exports = {
  // base: {
  //   html: {
  //     'font-size': { value: `100%` }, // 16px, for width <768px
  //     'font-size-md': { value: `112.5%` }, // 18px, for 768px <= width < 1400px
  //     'font-size-xxl': { value: `125%` }, // 20px, for width >= 1400px
  //   },
  //   'font-size': { value: `1rem` }, // default 16px
  //   'line-height': { value: 1.5 },
  //   'border-width': { value: `1px` },
  //   'border-radius': { value: `0.25rem` }, // 4px
  // },
  // 'letter-spacing': { extra: { value: `0.03rem` } },
  // heading: { 'font-weight': { value: `500` } },
  // border: {
  //   width1: { value: `{${prefix4g}.size.base.border-width.value}` }, // 1
  //   width2: { value: `2px` },
  //   width3: { value: `3px` },
  //   width4: { value: `4px` },
  //   width5: { value: `5px` },
  //   radius: {
  //     rounded1: { value: `{${prefix4g}.size.base.border-radius.value}` }, // 4
  //     rounded2: { value: '0.375rem' }, // 6
  //     rounded3: { value: '0.5rem' }, // 8
  //     'rounded-pill': { value: '50rem' }, // 足够大才能显示圆角
  //   },
  // },
  shadow: {
    val: {
      value: `0 0.125rem 0.5rem {${prefix4g}.color.shadow.value}`,
      replaceRefs: 'all',
    },
    small: {
      value: `0 0.0625rem 0.375rem {${prefix4g}.color.shadow.value}`,
      replaceRefs: 'all',
    },
    large: {
      value: `0 0.25rem 0.75rem {${prefix4g}.color.shadow.value}`,
      replaceRefs: 'all',
    },
  },
  // container: {
  //   width: {
  //     val: { value: `100%` },
  //     fluid: { value: `100%` },
  //     sm: { value: `33.75rem` }, // 540，max-width
  //     md: { value: `45rem` }, // 720
  //     lg: { value: `60rem` }, // 960
  //     xl: { value: `71.25rem` }, // 1140
  //     xxl: { value: `82.5rem` }, // 1320
  //   },
  // },
  // content: {
  //   spacing: {
  //     val: { value: `1.875rem` }, // 30px
  //     xs: { value: `1.25rem` }, // 20px
  //     half: { value: `0.9375rem` },
  //     'xs-half': { value: `0.625rem` },
  //   },
  //   title: {
  //     'font-size': { value: `1.25rem` }, // 20px
  //     'font-weight': { value: `500` },
  //   },
  // },
  // hyperlink: {
  //   focus: {
  //     'border-radius': { value: `{${prefix4g}.size.base.border-radius.value}` },
  //     'box-shadow': {
  //       value: `0 0 0 0.125rem {${prefix4g}.color.hyperlink.focus.box-shadow-color.value}`,
  //       replaceRefs: `all`,
  //     },
  //     outline: { value: `none` },
  //   },
  // },
};
