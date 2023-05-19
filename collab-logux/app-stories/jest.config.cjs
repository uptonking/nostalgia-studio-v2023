const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: 'app-logux',
  rootDir: '../..',
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
