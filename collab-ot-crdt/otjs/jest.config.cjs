const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: 'otjs-example-ts',
  rootDir: '.',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
