// webpack config for production

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const commonConfig = require('./webpack.common');

module.exports = merge(commonConfig, {
  mode: 'production',
  // false 不创建map
  devtool: 'source-map',
  target: 'browserslist',
  plugins: [
    new MiniCssExtractPlugin({
      // filename: '[name].css',
      filename: 'styles.css',
      // chunkFilename: '[id].css',
      ignoreOrder: false,
    }),
  ],
});
