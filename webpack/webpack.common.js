// shared webpack config object for dev, build, prod, demo...

const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CircularDependencyPlugin = require('circular-dependency-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  // mode: 'development',
  // devtool: 'eval-source-map',

  // entry: path.resolve(__dirname, '../src/render.js'),
  // output: {
  //   filename: 'main.js',
  //   path: path.resolve(__dirname, '../dist'),
  // },
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              rootMode: 'upward',
            },
          },
          {
            loader: '@linaria/webpack5-loader',
            options: {
              sourceMap: process.env.NODE_ENV !== 'production',
              babelOptions: {
                rootMode: 'upward',
                plugins: [
                  '@babel/plugin-syntax-jsx',
                  '@babel/plugin-proposal-class-properties',
                  [
                    // required for legacy desktop to parse the syntax
                    '@babel/plugin-proposal-decorators',
                    {
                      decoratorsBeforeExport: true,
                    },
                  ],
                ],
                presets: [
                  '@babel/preset-env',
                  [
                    '@babel/preset-typescript',
                    {
                      isTSX: true,
                      allExtensions: true,
                      onlyRemoveTypeImports: true,
                      allowNamespaces: true,
                      allowDeclareFields: true,
                    },
                  ],
                  '@babel/preset-react',
                  [
                    '@linaria',
                    {
                      evaluate: true,
                      displayName: true,
                    },
                  ],
                ],
              },
            },
          },
        ],
        resolve: {
          fullySpecified: false,
        },
        exclude: /node_modules/,
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          // isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              sourceMap: process.env.NODE_ENV !== 'production',
            },
          },
          {
            loader: 'sass-loader',
            options: {
              // when node-sass and sass were installed，by default sass-loader prefers sass.
              implementation: require('sass'),
              sassOptions: {
                // fiber: require('fibers'),
              },
            },
          },
        ],
      },
      {
        test: /\.less$/i,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                strictMath: true,
              },
            },
          },
        ],
      },
      // Fonts
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        // loader: 'file-loader',
        type: 'asset/resource',
        // generator: {
        //   filename: 'fonts/[hash].[ext]',
        // },
      },
      // Files
      {
        test: /\.(jpg|jpeg|png|gif|svg|ico)$/,
        // loader: 'file-loader',
        type: 'asset/resource',
        // generator: {
        //   filename: 'static/[hash].[ext]',
        // },
      },
      {
        test: /\.js$/,
        use: 'source-map-loader',
        enforce: 'pre',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: 'styles.css',
    }),
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
    //   // set the current working directory for displaying module paths
    //   cwd: process.cwd(),
    // }),
    // new HtmlWebpackPlugin({
    // template: path.resolve(process.cwd(), 'public/index.html'),
    // template: './public/demo.html',
    // filename: 'index.html',
    // }),
  ],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {},
  },
  experiments: {
    topLevelAwait: true,
  },
  ignoreWarnings: [/Failed to parse source map/],
};
