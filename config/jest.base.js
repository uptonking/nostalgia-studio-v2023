module.exports = {
  verbose: true,
  preset: 'ts-jest',
  // testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  transform: {
    // '\\.[jt]sx?$': ['babel-jest', { rootMode: 'upward' }],
    '\\.[jt]sx?$': ['ts-jest'],
    '.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
  },
  moduleNameMapper: {
    '^.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$':
      'jest-transform-stub',
  },
};
