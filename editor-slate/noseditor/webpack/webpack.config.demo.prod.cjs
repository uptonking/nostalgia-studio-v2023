const path = require('path');
const { merge } = require('webpack-merge');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const devServerConfig = require('../../../webpack/webpack.prod');

module.exports = merge(devServerConfig, {
  entry: path.resolve(__dirname, '../example-client/render.tsx'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  plugins: [
    new webpack.DefinePlugin({
      // 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      __TEST__: JSON.stringify(false),
      __DEV__: JSON.stringify(false),
      'process.env': JSON.stringify(process.env),
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      // template: path.resolve(process.cwd(), 'demo.html'),
      // filename: 'index.html',
    }),
  ],
  // resolve: {
  //   alias: {
  //     react: path.resolve(__dirname, '../../node_modules/react'),
  //     'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
  //   },
  // },
  // devServer: {
  //   contentBase: path.resolve(__dirname, '../dist'),
  // },
});
