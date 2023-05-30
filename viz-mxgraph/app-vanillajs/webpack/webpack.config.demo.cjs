const path = require('path');
const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const devServerConfig = require('../../../webpack/webpack.server');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = merge(devServerConfig, {
  entry: path.resolve(__dirname, '../src/render.ts'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  module: {
    rules: [
      {
        test: /\.(ico|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
        loader: 'url-loader',
        options: {
          name: 'images/[hash].[ext]',
          limit: 10000,
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      // template: path.resolve(process.cwd(), 'demo.html'),
      template: './public/index.html',
      // filename: 'index.html',
    }),
    // new CircularDependencyPlugin({
    //   exclude: /a\.js|node_modules/,
    //   failOnError: true,
    //   allowAsyncCycles: false,
    //   cwd: process.cwd(),
    // }),
  ],
  // devServer: {
  //   contentBase: path.resolve(__dirname, '../dist'),
  // },
});
