const path = require('path');

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: {
    prosemirror: './prosemirror',
  },
  output: {
    globalObject: 'self',
    path: path.resolve(__dirname, './dist/'),
    filename: '[name].bundle',
    publicPath: '/prosemirror/dist/',
  },
  devServer: {
    contentBase: path.join(__dirname),
    compress: true,
    publicPath: '/dist/',
  },
};
