const baseConfig = require('./config/jest.base');
const rootConfig = {
  projects: [
    '<rootDir>/packages/*/jest.config.js',
    // '<rootDir>',
  ],
};

module.exports = {
  ...baseConfig,
  ...rootConfig,
};
