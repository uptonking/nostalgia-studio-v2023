const baseConfig = require('../../../config/jest.base');
const pkgConfig = {
  displayName: 'typewriter-document',
  rootDir: '.',
  // setupFilesAfterEnv: ['<rootDir>/config/setupTests.js'],
};

module.exports = {
  ...baseConfig,
  ...pkgConfig,
  globals: {
    'ts-jest': {
      isolatedModules: true, // Disable type-checking
    },
  },
};
