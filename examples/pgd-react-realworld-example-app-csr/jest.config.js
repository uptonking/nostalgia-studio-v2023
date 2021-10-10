const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: '@examples-hub/sample-eg-react-spectrum-realworld',
  rootDir: '../..',
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
