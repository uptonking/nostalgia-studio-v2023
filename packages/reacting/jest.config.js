const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: '@datalking/reacting',
  rootDir: '../..',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
