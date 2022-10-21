const baseConfig = require('../../../config/jest.base');
const pkgConfig = {
  displayName: 'ottypes-text',
  rootDir: '.',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
