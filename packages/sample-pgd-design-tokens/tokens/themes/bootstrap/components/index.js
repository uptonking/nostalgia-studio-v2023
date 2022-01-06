const { compPrefix: prefix4c } = require('../../../utils/globalConfig');
const { globalPrefix: prefix4g } = require('../../../utils/globalConfig');

const button = require('./button');
const checkbox = require('./checkbox');
module.exports = {
  [prefix4c]: { button, checkbox },
};
