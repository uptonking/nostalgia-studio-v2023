const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: 'json-patch-examples-stories',
  rootDir: '.',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
