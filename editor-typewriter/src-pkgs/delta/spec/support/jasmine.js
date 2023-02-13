export default {
  spec_dir: 'test',
  spec_files: ['**/*.?(m)js'],
  helpers: ['helpers/**/*.?(m)js'],
  env: {
    stopSpecOnExpectationFailure: false,
    random: true,
  },
};
