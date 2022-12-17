const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const devServerConfig = require('../../../webpack/webpack.server');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// const webPolyfillFiles = ['storage', 'byline', 'utils-polyfillable'];

module.exports = merge(devServerConfig, {
  // entry: path.resolve(__dirname, '../src/index.ts'),
  entry: path.resolve(__dirname, '../app-web/minimal.ts'),
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  target: 'web',
  node: {
    global: true,
  },

  plugins: [
    new NodePolyfillPlugin({
      excludeAliases: ['console'],
    }),
    // new webpack.NormalModuleReplacementPlugin(/.ts$/, (result) => {
    //   const resource = result.createData.resource;
    //   if (resource) {
    //     // console.log(';; imp-res', resource)
    //     const filenamePaths = resource.split('/');
    //     const filename = filenamePaths[filenamePaths.length - 1].split('.')[0];
    //     if (webPolyfillFiles.includes(filename)) {
    //       result.createData.resource = path.resolve(
    //         __dirname,
    //         `../src-web/${filename}.ts`,
    //       );
    //     }
    //   }
    // }),
    new CircularDependencyPlugin({
      // exclude detection of files based on a RegExp
      exclude: /a\.js|node_modules/,
      // include specific files based on a RegExp
      // include: /dir/,
      // add errors to webpack instead of warnings
      failOnError: true,
      // allow import cycles that include an asynchronous import,
      // e.g. via import(/* webpackMode: "weak" */ './file.js')
      allowAsyncCycles: false,
      // set the current working directory for displaying module paths
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
  // devServer: {
  //   contentBase: path.resolve(__dirname, '../dist'),
  // },
});
