var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');
var WebpackCleanupPlugin = require('webpack-cleanup-plugin');

module.exports = {
  devtool: 'source-map',
  entry: [
    path.resolve(__dirname,'src','index.js')
  ],
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
    sourceMapFilename: '[file].map'
  },
  module: {
    loaders: [
      {
        test: /\.(js|jsx)$/,
        loaders: ['react-hot', 'babel'],
        include: path.join(__dirname, 'src')
      },
      {
        test: /\.styl$/,
        loaders: ['style-loader', 'css-loader?importLoaders=1', 'postcss-loader', 'stylus-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff(2)?)(\?v=\d+\.\d+\.\d+)?/,
        loader: 'url'
      }
    ]
  },
  plugins: [
    new WebpackCleanupPlugin(),
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        warnings: false
      }
    }),
    new ExtractTextPlugin('bundle.css')
  ],
  postcss: [autoprefixer({browsers: ['last 2 versions']})],
  debug: false
};
