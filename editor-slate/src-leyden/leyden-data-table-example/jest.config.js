const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: 'sample-react-app-ts',
  rootDir: '../..',
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
