const { compPrefix: prefix4c } = require('../../../utils/globalConfig');
const { globalPrefix: prefix4g } = require('../../../utils/globalConfig');

const button = require('./button');
const buttonGroup = require('./button-group');
const card = require('./card');
const navbar = require('./navbar');
const sidebar = require('./sidebar');
const form = require('./forms/form');
const input = require('./forms/input');
const checkbox = require('./forms/checkbox');
const radio = require('./forms/radio');
const select = require('./forms/select');
const switcher = require('./forms/switcher');
const range = require('./forms/range');
const file = require('./forms/file');
const code = require('./html-code');
const list = require('./html-list');
const table = require('./html-table');
const htmlDetails = require('./html-details');
const modal = require('./modal');
const alert = require('./alert');
const badge = require('./badge');
const breadcrumb = require('./breadcrumb');
const dropdown = require('./dropdown');
const pagination = require('./pagination');
const progress = require('./progress');
const tooltip = require('./tooltip');

module.exports = {
  [prefix4c]: {
    button,
    'button-group': buttonGroup,
    card,
    navbar,
    sidebar,
    form,
    'form-input': input,
    'form-checkbox': checkbox,
    'form-radio': radio,
    'form-select': select,
    'form-switcher': switcher,
    'form-range': range,
    'form-file': file,
    'html-code': code,
    'html-list': list,
    'html-table': table,
    'html-details': htmlDetails,
    modal,
    alert,
    badge,
    breadcrumb,
    dropdown,
    pagination,
    progress,
    tooltip,
  },
};
