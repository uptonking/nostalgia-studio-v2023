// default webpack config for dev, build & test

const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const commonConfig = require('./webpack.common');

function checkAppEnv(env) {
  return (
    process.env.APP_ENV && process.env.APP_ENV.toLowerCase().indexOf(env) !== -1
  );
}

// 用在react项目打包阶段，会启用@babel/preset-react，不会启用react-refresh/babel
const isEnvReactHotReload = checkAppEnv('reacthot');

module.exports = merge(commonConfig, {
  mode: 'development',
  // eval-cheap-source-map 更快
  devtool: 'eval-source-map',
  // 解决热加载的问题 https://github.com/webpack/webpack-dev-server/issues/2758
  // target: process.env.NODE_ENV === 'production' ? 'browserslist' : 'web',
  target: 'web',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    isEnvReactHotReload && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
});
