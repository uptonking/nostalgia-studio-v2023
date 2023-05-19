const baseConfig = require('../../../config/jest.base');
const pkgConfig = {
  displayName: 'nanostores',
  rootDir: '.',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
