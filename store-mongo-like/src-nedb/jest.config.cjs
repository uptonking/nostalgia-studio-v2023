const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: 'nedb-ts',
  rootDir: '.',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
