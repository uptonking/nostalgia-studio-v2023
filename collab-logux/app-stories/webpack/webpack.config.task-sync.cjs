const path = require('path');
const { merge } = require('webpack-merge');
const devServerConfig = require('../../../webpack/webpack.server');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');

module.exports = merge(devServerConfig, {
  entry: path.resolve(__dirname, '../src-task-list-sync/client/main.tsx'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  plugins: [
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
    port: 8999,
    proxy: {
      '/logux': {
        target: 'ws://127.0.0.1:31337',
        changeOrigin: true,
        ws: true,
        // pathRewrite: (path) => path.replace(/^\/logux/, ''),
        pathRewrite: { '^/logux': '' },
      },
      '/api': {
        target: 'http://127.0.0.1:31337',
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''),
        pathRewrite: { '^/api': '' },
      },
    },
  },
});
