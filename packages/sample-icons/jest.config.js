const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: '@pgd/components',
  rootDir: '../..',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
