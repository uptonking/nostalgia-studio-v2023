const baseConfig = require('../../config/jest.base');
const pkgConfig = {
  displayName: 'crdt-examples-stories',
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
