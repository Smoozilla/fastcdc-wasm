const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  mode:'development',
  entry: {
    worker: './src/worker.js',
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'bin'),
  },
  target: 'webworker',
  externals: [nodeExternals({
      whitelist: [
          'fs',
      ]
  })],
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './fastcdc-wasm/fastcdc_wasm_bg.wasm', to: './' },
      ],
    }),
  ],

};