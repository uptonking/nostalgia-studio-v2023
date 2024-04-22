const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const devServerConfig = require('../../../webpack/webpack.prod');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = merge(devServerConfig, {
  entry: path.resolve(__dirname, '../src/render.tsx'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  plugins: [
    new webpack.DefinePlugin({
      // 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      _a_TEST__: JSON.stringify(false),
      __DEV__: JSON.stringify(false),
      'process.env': JSON.stringify(process.env),
    }),
    new CircularDependencyPlugin({
      exclude: /a\.js|node_modules/,
      failOnError: true,
      allowAsyncCycles: false,
      cwd: process.cwd(),
    }),
    new HtmlWebpackPlugin({
      // template: path.resolve(process.cwd(), 'demo.html'),
      template: './public/index.html',
      // filename: 'index.html',
    }),
  ],
  // resolve: {
  //   alias: {
  //     react: path.resolve(__dirname, '../../node_modules/react'),
  //     'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
  //   },
  // },
  devServer: {
    // contentBase: path.resolve(__dirname, '../dist'),
    port: 7990,
  },
});
