const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: 'sample-react-comp-ts',
  rootDir: '../..',
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
