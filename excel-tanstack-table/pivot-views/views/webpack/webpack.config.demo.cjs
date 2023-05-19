const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const devServerConfig = require('../../../../webpack/webpack.server');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const dotenv = require('dotenv');

dotenv.config();

module.exports = merge(devServerConfig, {
  entry: path.resolve(__dirname, '../src/main.tsx'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  plugins: [
    // new CircularDependencyPlugin({
    //   exclude: /a\.js|node_modules/,
    //   failOnError: true,
    //   allowAsyncCycles: false,
    //   cwd: process.cwd(),
    // }),
    new webpack.DefinePlugin({
      // 'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      // 'process.env.BACKEND': JSON.stringify(process.env.BACKEND),
      'process.env': JSON.stringify(process.env),
    }),
    new HtmlWebpackPlugin({
      // template: path.resolve(process.cwd(), 'demo.html'),
      template: './public/index.html',
      // filename: 'index.html',
    }),
  ],
  resolve: {
    // alias: {
    //   react: path.resolve(__dirname, '../../node_modules/react'),
    //   'react-dom': path.resolve(__dirname, '../../node_modules/react-dom'),
    // },
    fallback: {
      path: false,
    },
  },
  devServer: {
    // contentBase: path.resolve(__dirname, '../dist'),
    port: 8999,
  },
});
