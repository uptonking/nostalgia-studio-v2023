const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: 'mxgraph-core',
  rootDir: '../..',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
