const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: 'sample-vanilla-es6',
  rootDir: '../..',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
