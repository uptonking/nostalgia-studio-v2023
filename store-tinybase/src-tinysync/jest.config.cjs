const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: 'tinysync',
  rootDir: '.',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
  globals: {
    'ts-jest': {
      useESM: true,
      isolatedModules: true,
    },
  },
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
};
