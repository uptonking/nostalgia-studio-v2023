const path = require('path');
const { merge } = require('webpack-merge');
const devServerConfig = require('../../../webpack/webpack.server');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = merge(devServerConfig, {
  entry: path.resolve(__dirname, '../src/render.tsx'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  plugins: [
    // new CircularDependencyPlugin({
    //   // exclude detection of files based on a RegExp
    //   exclude: /a\.js|node_modules/,
    //   // include specific files based on a RegExp
    //   // include: /dir/,
    //   // add errors to webpack instead of warnings
    //   failOnError: true,
    //   // allow import cycles that include an asynchronous import,
    //   // e.g. via import(/* webpackMode: "weak" */ './file.js')
    //   allowAsyncCycles: false,
    //   cwd: process.cwd(),
    // }),
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
