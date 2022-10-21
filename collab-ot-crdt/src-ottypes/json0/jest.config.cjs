const baseConfig = require('../../../config/jest.base');
const pkgConfig = {
  displayName: 'ottypes-json0',
  rootDir: '.',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
