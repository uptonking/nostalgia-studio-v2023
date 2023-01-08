const path = require('path');
const { merge } = require('webpack-merge');
const prodConfig = require('../../../webpack/webpack.prod');
// const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = merge(prodConfig, {
  entry: path.resolve(__dirname, '../src/index.js'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  // plugins: [
  // ],
  // devServer: {
  //   contentBase: path.resolve(__dirname, '../dist'),
  // },
});
