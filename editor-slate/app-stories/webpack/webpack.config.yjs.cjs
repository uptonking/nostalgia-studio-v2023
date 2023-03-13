const path = require('path');
const { merge } = require('webpack-merge');
const devServerConfig = require('../../../webpack/webpack.server');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WindiCSSWebpackPlugin = require('windicss-webpack-plugin');
// import WindiCSSWebpackPlugin from 'windicss-webpack-plugin';

module.exports = merge(devServerConfig, {
  entry: path.resolve(__dirname, '../src/render-yjs.tsx'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      // template: path.resolve(process.cwd(), 'demo.html'),
      template: './public/index.html',
      // filename: 'index.html',
    }),
    new WindiCSSWebpackPlugin({
      virtualModulePath: '../yjs-client',
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
