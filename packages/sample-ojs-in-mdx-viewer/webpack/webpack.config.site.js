const path = require('path');
const { merge } = require('webpack-merge');
const devServerConfig = require('../../../webpack/webpack.server');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

// const isProd = process.env.NODE_ENV === 'production';

const wpConfig = merge(devServerConfig, {
  entry: path.resolve(__dirname, '../site/render.tsx'),
  output: {
    filename: 'site.main.js',
    path: path.resolve(__dirname, '../dist'),
  },
  // ignoreWarnings: [/Failed to parse source map/],
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
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.mdx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              rootMode: 'upward',
            },
          },
          {
            loader: '@mdx-js/loader',
            options: {
              // rehypePlugins: [rehypePrism]
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      // template: path.resolve(process.cwd(), 'demo.html'),
      template: './public/index.html',
      // filename: 'index.html',
    }),
  ],

  // devServer: {
  //   contentBase: path.resolve(__dirname, '../dist'),
  // },
});

// console.log('site-wpCfg, ', JSON.stringify(wpConfig));

module.exports = wpConfig;
