const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: '@datalking/reacting-examples',
  rootDir: '../..',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
