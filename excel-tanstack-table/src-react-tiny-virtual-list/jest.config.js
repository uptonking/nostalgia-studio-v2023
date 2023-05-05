const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: 'react-tiny-virtual-list',
  rootDir: '../..',
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
