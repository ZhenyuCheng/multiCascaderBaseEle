const merge = require('webpack-merge');
const baseConfig = require('./webpack.config.example');

module.exports = merge(baseConfig, {
    devtool: 'source-map',
    output: {
        filename: '[name].js',
        chunkFilename: 'chunk_[name].js'
    }
});