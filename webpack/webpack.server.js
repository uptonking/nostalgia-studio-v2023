// webpack config for dev demo using webpack-dev-server

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const devConfig = require('./webpack.dev');

module.exports = merge(devConfig, {
  // devServer config flags are only read by WDS but not Webpack
  // 若要使用热加载，还需要在cli上传入 --hot
  devServer: {
    // contentBase: path.resolve(__dirname, '../dist'),
    // open: true,
    host: '0.0.0.0',
    port: 8999,
    hot: true,
    compress: true,
    historyApiFallback: true,
    // inline: true,
    // clientLogLevel: 'silent',
    // clientLogLevel: 'debug',
  },
});
