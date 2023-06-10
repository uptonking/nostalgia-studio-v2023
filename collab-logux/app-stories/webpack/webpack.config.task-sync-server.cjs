const path = require('path');
const { merge } = require('webpack-merge');
const devConfig = require('../../../webpack/webpack.dev');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = merge(devConfig, {
  target: 'node',
  entry: path.resolve(__dirname, '../src-task-list-sync/server/index.ts'),
  output: {
    filename: 'task-sync-server.js',
    path: path.resolve(__dirname, '../dist'),
  },
  plugins: [
    new CircularDependencyPlugin({
      exclude: /a\.js|node_modules/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
    }),
    new CleanWebpackPlugin(),
  ],
  // resolve: {
  //   alias: {
  //     react: path.resolve(__dirname, '../../node_modules/react'),
  //     'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
  //   },
  // },
});
