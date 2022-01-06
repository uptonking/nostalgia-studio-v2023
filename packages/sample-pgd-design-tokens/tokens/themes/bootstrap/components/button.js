const { globalPrefix: prefix4g } = require('../../../utils/globalConfig');
module.exports = {
  height: { value: '3.2rem' },
  'line-height': { value: '3.2rem' },
  padding: { value: '0 1.5rem' },
  'font-size': { value: '2rem' },
  'text-align': { value: 'center' },
  'border-width': { value: `{${prefix4g}.size.base.border.width.value}` },
  'border-radius': { value: `{${prefix4g}.size.base.border.radius.value}` },
  'border-color': { value: `{${prefix4g}.color.palette.gray-200.value}` },
  'text-color': { value: `{${prefix4g}.color.palette.gray-900.value}` },
  'background-color': { value: `{${prefix4g}.color.palette.gray-300.value}` },

  primary: {
    'background-color': { value: `{${prefix4g}.color.brand.primary.value}` },
    'text-color': { value: `{${prefix4g}.color.palette.gray-200.value}` },
  },
};
