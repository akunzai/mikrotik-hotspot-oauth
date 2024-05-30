'use strict';

const HtmlWebPackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const path = require('path');

module.exports = (env, argv) => {
  const devMode = argv.mode !== 'production';
  return {
    mode: argv.mode,
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'authorization.js',
    },
    devServer: {
      static: {
        directory: path.resolve(__dirname, 'public'),
      },
      historyApiFallback: true,
      hot: false,
      host: '0.0.0.0',
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
          },
        }
      ],
    },
    optimization: {
      minimizer: [new TerserPlugin()],
    },
    plugins: [
      new ProgressBarPlugin(),
      new CopyPlugin({
        patterns: devMode ? [{
          from: './node_modules/blueimp-md5/js/md5.js',
          to: 'md5.js',
        }, {
          from: './public/index.js',
          to: 'index.js',
        }] : [{
          from: './node_modules/blueimp-md5/js/md5.min.js',
          to: 'md5.js',
        }, {
          from: './public/login.prod.html',
          to: 'login.html',
        }]
      }),
      devMode ? new HtmlWebPackPlugin({
        template: './public/login.html',
        filename: 'login.html',
      }) : null,
    ],
    performance: { hints: false }
  };
};
