const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: 'mxgraph-app-vanilla-ts',
  rootDir: '../..',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
