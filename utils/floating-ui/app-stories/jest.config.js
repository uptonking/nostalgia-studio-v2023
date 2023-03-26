const baseConfig = require('../../../config/jest.base');
const pkgConfig = {
  displayName: 'slate-app-stories',
  rootDir: '../..',
  setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
